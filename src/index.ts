/**
 * External dependencies
 */
import { has, isEmpty, castArray } from 'lodash';
import { debug, getInput, info, setFailed } from '@actions/core';
import { promises as fs } from 'fs';
import Ajv from 'ajv-draft-04';
import axios from 'axios';
import fg from 'fast-glob';
import pc from 'picocolors';
import type { ErrorObject } from 'ajv';

/**
 * Internal dependencies
 */
import { errorsText } from './utils';

const ajv = new Ajv({ allErrors: true });

async function run() {
	try {
		const files = getInput('files');
		const localSchema = getInput('schema');

		info('Validating JSON files');
		info(`Finding files from ${files}`);

		const entries = await fg(castArray(files));
		const failures: {
			file: string;
			errors: ErrorObject[];
		}[] = [];
		const skippedFiles: string[] = [];

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
			}
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
