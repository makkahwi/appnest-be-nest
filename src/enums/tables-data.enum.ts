export enum PropertyFields {
    UNIQUE = "unique",
    REGEX = "regex",
    DEFAULT_VALUE = "defaultValue",
    REQUIRED = "required",
    TYPE = "type",
    TITLE = "title",
    UNIQUE_KEY = "uniqueKey",
}

export enum ModalFields {
    TITLE = "title",
}

export enum ProjectFields {
    DESCRIPTION = "description",
    TITLE = "title",
}

export enum TablesNames {
    PROPERTY = "property",
    MODAL = "modal",
    PROJECT = "project",
}

export type AllTablesColumns = PropertyFields | ModalFields | ProjectFields;
