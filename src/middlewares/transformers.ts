/* eslint-disable @typescript-eslint/no-unused-vars */
import { TablesNames } from "src/enums/tables-data.enum";

const fieldMap = (
    value: any
): {
    [dataType: string]: any;
} => ({
    number: Number(value),
    boolean: value === "true",
    date: new Date(value),
});

function newInstanceTransformer<DtoReturnType>(body: any, table: TablesNames) {
    const modifiedBody: {
        [field: string]: any;
    } = { ...body };

    // ----- tables' transformers -----
    if (table === TablesNames.PROPERTY) {
    }

    if (table === TablesNames.MODAL) {
    }

    if (table === TablesNames.PROJECT) {
    }

    return modifiedBody as DtoReturnType;
}

export { newInstanceTransformer };
