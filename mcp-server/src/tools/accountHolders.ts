import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Highnote } from "@highnote-ts/highnote-nodejs-sdk";
import { PhoneLabel } from "@highnote-ts/highnote-nodejs-sdk";
import { z } from "zod";

export function registerAccountHolderTools(
  server: McpServer,
  client: Highnote,
) {
  server.tool(
    "highnote_create_us_person_account_holder",
    "Create a US person account holder in Highnote. Required for card issuance workflows.",
    {
      givenName: z.string().min(2).max(255).describe("First name"),
      familyName: z.string().min(2).max(255).describe("Last name"),
      middleName: z.string().optional().describe("Middle name"),
      dateOfBirth: z
        .string()
        .describe("Date of birth in YYYY-MM-DD format, age must be 10-100"),
      email: z.string().email().optional().describe("Email address"),
      externalId: z
        .string()
        .max(255)
        .optional()
        .describe("Your external identifier"),
      streetAddress: z.string().describe("Street address"),
      extendedAddress: z
        .string()
        .optional()
        .describe("Apartment, suite, etc."),
      locality: z.string().describe("City or town"),
      region: z.string().describe("State or province (e.g. CA)"),
      postalCode: z.string().describe("Postal/ZIP code"),
      countryCodeAlpha3: z
        .string()
        .default("USA")
        .describe("3-letter country code (default: USA)"),
      phoneCountryCode: z
        .string()
        .optional()
        .describe("Phone country code (e.g. 1)"),
      phoneNumber: z
        .string()
        .optional()
        .describe("Phone number (e.g. 5551234567)"),
      phoneLabel: z
        .enum(["MOBILE", "HOME", "WORK", "SUPPORT"])
        .optional()
        .describe("Phone label"),
      ssn: z
        .string()
        .optional()
        .describe("Social Security Number (e.g. 123-45-6789)"),
    },
    async (params) => {
      try {
        const holder = await client.accountHolders.createUSPerson({
          personAccountHolder: {
            name: {
              givenName: params.givenName,
              familyName: params.familyName,
              ...(params.middleName && { middleName: params.middleName }),
            },
            dateOfBirth: params.dateOfBirth,
            ...(params.email && { email: params.email }),
            ...(params.externalId && { externalId: params.externalId }),
            billingAddress: {
              streetAddress: params.streetAddress,
              ...(params.extendedAddress && {
                extendedAddress: params.extendedAddress,
              }),
              locality: params.locality,
              region: params.region,
              postalCode: params.postalCode,
              countryCodeAlpha3: params.countryCodeAlpha3,
            },
            ...(params.phoneNumber &&
              params.phoneCountryCode && {
                phoneNumber: {
                  countryCode: params.phoneCountryCode,
                  number: params.phoneNumber,
                  label:
                    PhoneLabel[
                      (params.phoneLabel ?? "MOBILE") as keyof typeof PhoneLabel
                    ],
                },
              }),
            ...(params.ssn && {
              identificationDocument: {
                socialSecurityNumber: {
                  number: params.ssn,
                  countryCodeAlpha3: "USA",
                },
              },
            }),
          },
        });

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(holder, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error creating account holder: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "highnote_get_account_holder",
    "Get an account holder by ID.",
    {
      accountHolderId: z.string().describe("The account holder ID"),
    },
    async ({ accountHolderId }) => {
      try {
        const holder = await client.accountHolders.get(accountHolderId);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(holder, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error getting account holder: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "highnote_list_person_account_holders",
    "List person account holders with pagination.",
    {
      pageSize: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Number of results per page (default: 20)"),
      maxResults: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Maximum total results to return (default: 20)"),
    },
    async (params) => {
      try {
        const holders = [];
        const max = params.maxResults ?? 20;
        for await (const holder of client.accountHolders.listPersons({
          pageSize: params.pageSize,
        })) {
          holders.push(holder);
          if (holders.length >= max) break;
        }
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(holders, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error listing account holders: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
