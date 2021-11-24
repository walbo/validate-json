/**
 * External dependencies
 */
import { has, isEmpty, castArray } from 'lodash';
import { debug, getInput, info, setFailed } from '@actions/core';
import { promises as fs } from 'fs';
import AjvDraft04 from 'ajv-draft-04';
import Ajv from 'ajv';
import draft6MetaSchema from 'ajv/dist/refs/json-schema-draft-06.json';
import axios from 'axios';
import fg from 'fast-glob';
import pc from 'picocolors';
import type { ErrorObject } from 'ajv';

/**
 * Internal dependencies
 */
import { errorsText } from './utils';

function getAjv(version, options = {}) {
	const ajvOptions = {
		...options,
		allErrors: true,
	};

	switch (version) {
		case 'draft-04':
			return new AjvDraft04(ajvOptions);
		case 'draft-06': {
			const ajv = new Ajv();
			ajv.addMetaSchema(draft6MetaSchema);
			return ajv;
		}
		case 'draft-07':
			return new Ajv(ajvOptions);
		default:
			return false;
	}
}

async function run() {
	try {
		const files = getInput('files');
		const localSchema = getInput('schema');
		const printValidFiles = getInput('print-valid-files');
		const schemaVersion = getInput('schema-version');
		const allowMatchingProperties = getInput('allow-matching-properties');

		const ajv = getAjv(schemaVersion, { allowMatchingProperties });

		if (!ajv) {
			throw new Error('Unsupported schema');
		}

		info('Validating JSON files');
		info(`Finding files from ${files}`);
		info('');

		const entries = await fg(castArray(files));
		const failures: {
			file: string;
			errors: ErrorObject[];
		}[] = [];
		const skippedFiles: string[] = [];
		const validFiles: string[] = [];

		const fetchedSchemas = {};

		for (const file of entries) {
			const content = await fs.readFile(file, 'utf8');
			const parsedContent = JSON.parse(content);

			let schema: object;

			if (localSchema) {
				const localSchemaContent = await fs.readFile(
					localSchema,
					'utf8',
				);
				schema = JSON.parse(localSchemaContent);
			} else if (has(parsedContent, '$schema')) {
				const schemaUrl = parsedContent.$schema;

				debug(`\nFound $schema in: ${file}`);

				if (!has(fetchedSchemas, schemaUrl)) {
					debug(`Fetching: ${schemaUrl}`);
					const schemaResponse = await axios.get(schemaUrl);
					fetchedSchemas[schemaUrl] = schemaResponse.data;
				}

				schema = fetchedSchemas[schemaUrl];
			} else {
				skippedFiles.push(file);
				continue;
			}

			const validate = ajv.compile(schema);
			const valid = validate(parsedContent);

			if (!valid) {
				failures.push({ file, errors: validate.errors });
			} else {
				validFiles.push(file);
			}
		}

		if (printValidFiles && !isEmpty(validFiles)) {
			info('✅ Valid files:');
			validFiles.forEach((file) => {
				info(`    ${file}`);
			});
			info('');
		}

		if (!isEmpty(skippedFiles)) {
			skippedFiles.forEach((file) => {
				info(pc.underline(`/${file}`));
				info(`    ${pc.yellow('warning')}  No schema found`);
				info('');
			});
		}

		if (!isEmpty(failures)) {
			failures.forEach(({ file, errors }) => {
				info(pc.underline(`/${file}`));
				info(errorsText(errors));
			});

			setFailed('Invalid JSON files found');
		}
	} catch (error) {
		setFailed(error.message);
	}
}

run();
