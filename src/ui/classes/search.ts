/**
 * Performs a deep search on an array of objects based on provided property names and a search string.
 *
 * @param properties - List of top-level property names to search in.
 * @param array - The array of objects to filter.
 * @param searchString - The search string to find in the properties.
 * @returns Filtered array of objects that contain the search string in one of the provided property names.
 */
export function searchList<T>(properties: string[], array: Array<T>, searchString: string): Array<T> {
    function searchObject(obj: T) {
        if (obj.constructor !== Object) {
            return false;
        }

        for (const key of properties) {
            if (obj.hasOwnProperty(key)) {
                // @ts-ignore
                const value = obj[key];

                if (value.constructor === String && value.toLowerCase().includes(searchString)) {
                    return true;
                }

                if (value.constructor === Number && value.toString().toLowerCase().includes(searchString)) {
                    return true;
                }

                if (value.constructor === Object) {
                    if (JSON.stringify(value).toLowerCase().includes(searchString)) {
                        return true;
                    }
                }

                if (Array.isArray(value)) {
                    if (JSON.stringify(value).toLowerCase().includes(searchString)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    return array.filter(item => searchObject(item));
}