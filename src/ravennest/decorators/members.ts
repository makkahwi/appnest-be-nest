import { SetMetadata } from "@nestjs/common";

export const MembersOnly = () => SetMetadata("isMember", true);
