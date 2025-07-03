import { GraphQLError } from "graphql";
import { ApplicationAccessLevel, PrismaClient } from "../../generated/prisma";
import { JWTToken } from "../jwt";

class RBAC {

    constructor(
        private readonly prismaClient: PrismaClient | null,
        private readonly userToken: JWTToken | null,
    ) {}

    // Dangerous means the action is required to be checked against the database to get the user's role
    // Instead of using the JWT token's applicationAccessLevel , as it might be outdated but non-expired
    public async dangerous(): Promise<RBAC> {
        if (!this.userToken) {
            return new RBAC(this.prismaClient, {
                userId: "",
                applicationAccessLevel: ApplicationAccessLevel.GUEST,
            });
        }

        const user = await this.prismaClient?.user.findUnique({
            where: {
                id: this.userToken.userId
            },
            select: {
                applicationAccessLevel: true,
            }
        })

        // Just to be safe
        if ( !user ) {
            throw new GraphQLError(`User not found. (DANGEROUS)`, {
                extensions: {
                  code: 'UNAUTHORIZED'
                }
            });
        }

        return new RBAC(this.prismaClient, {
            ...this.userToken,
            applicationAccessLevel: user.applicationAccessLevel,
        });
    }

    public app(): ApplicationPermissionChecker {
        return new ApplicationPermissionChecker(
            this.userToken?.applicationAccessLevel ?? ApplicationAccessLevel.GUEST,
            ApplicationAccessLevel.GUEST,
            false,
        )
    }
}

class ApplicationPermissionChecker {
    
    private static readonly APP_ROLE_MAP: Map<ApplicationAccessLevel, number> = new Map([
        [ApplicationAccessLevel.GUEST, 0],
        [ApplicationAccessLevel.USER, 1],
        [ApplicationAccessLevel.ADMIN, 2],
        [ApplicationAccessLevel.SUPER_ADMIN, 3],
    ]);
    
    constructor(
        private readonly userApplicationRole: ApplicationAccessLevel,
        private readonly requiredRole: ApplicationAccessLevel,
        private readonly isExact: boolean,
    ) {}

    public admin(): ApplicationPermissionChecker {
        return new ApplicationPermissionChecker(
            this.userApplicationRole,
            ApplicationAccessLevel.ADMIN,
            this.isExact,
        )
    }

    public guest(): ApplicationPermissionChecker {
        return new ApplicationPermissionChecker(
            this.userApplicationRole,
            ApplicationAccessLevel.GUEST,
            this.isExact,
        )
    }

    public superAdmin(): ApplicationPermissionChecker {
        return new ApplicationPermissionChecker(
            this.userApplicationRole,
            ApplicationAccessLevel.SUPER_ADMIN,
            this.isExact
        )
    }

    public user(): ApplicationPermissionChecker {
        return new ApplicationPermissionChecker(
            this.userApplicationRole,
            ApplicationAccessLevel.USER,
            this.isExact
        )
    }

    public exact(): ApplicationPermissionChecker {
        return new ApplicationPermissionChecker(
            this.userApplicationRole,
            this.requiredRole,
            true,
        )
    }
    
    public view(): boolean {
        const userRoleInNumber = ApplicationPermissionChecker.APP_ROLE_MAP.get(this.userApplicationRole) ?? 0;
        const requiredRoleInNumber = ApplicationPermissionChecker.APP_ROLE_MAP.get(this.requiredRole);

        if ( requiredRoleInNumber === undefined ) { // Guest can be 0 which would fail the !requiredRoleInNumber check so directly check for undefined
            throw new GraphQLError(`This role: ${this.requiredRole} is not a valid role.`, {
                extensions: {
                  code: 'UNAUTHORIZED'
                }
            });
        }
        return this.isExact ? userRoleInNumber === requiredRoleInNumber : userRoleInNumber >= requiredRoleInNumber;
    }

    public ensure(): void {
        if ( !this.view() ) {
            throw new GraphQLError(`${this.userApplicationRole} is not authorized to access this resource. (ENSURE)`, {
                extensions: {
                  code: 'UNAUTHORIZED'
                }
            });
        }
    }

}

export default RBAC;