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

export enum UserFields {
    DESCRIPTION = "description",
    TITLE = "title",
    USERNAME = 'username',
    FIRSTNAME  = 'firstName',
    LASTNAME = 'lastName',
    EMAIL = 'email',
    PASSWORD = 'password',
    PHONE_NUMBER = 'phoneNumber',
    ADDRESS = 'address',
    GENDER = 'gender',
    ROLE = 'role',
    AVATAR = 'avatar',
}

export enum TablesNames {
    PROPERTY = "property",
    MODAL = "modal",
    PROJECT = "project",
    USERS = "users",
}

export type AllTablesColumns = UserFields | PropertyFields | ModalFields | ProjectFields;
