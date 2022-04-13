/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import pc from 'picocolors';
import type { ErrorObject } from 'ajv';

export function errorsText(errors: ErrorObject[] | null): string {
	if (!errors || errors.length === 0) {
		return 'No errors';
	}

	return errors
		.map((err) => {
			if (!isEmpty(err.instancePath)) {
				return `${err.instancePath} ${err.message}`;
			}

			return err.message;
		})
		.reduce(
			(text, msg) => `${text}${pc.red('error')}    ${msg}\n    `,
			'    ',
		);
}

export function isValidUrl(string: string) :boolean {
  
  try {
    new URL(string);
  } catch (_) {
    return false;  
  }

  return true;
}