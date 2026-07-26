# Crisis Response Protocol

Version: 2026-07-23.1  
Status: engineering baseline; requires qualified safety/legal review before launch.

## Runtime behavior

- Self-harm or violence signals stop card drawing and present reality-first safety guidance.
- The product does not diagnose, assess clinical risk level, promise confidentiality, contact emergency services, or claim to know the user's location.
- The user is told to contact local emergency services when danger is immediate, avoid being alone, and tell a trusted person.
- Language does not determine country. Regional contacts are explicitly labeled and shown only as options for people actually in those regions.
- Safety guidance is always free and cannot be disabled by entitlement, experiment, analytics consent, or payment state.

## Verified resource registry

| Region | Resource | Runtime contact | Official source | Verified |
| --- | --- | --- | --- | --- |
| Republic of Korea | 24-hour Suicide Prevention Hotline | 109 | Korea Ministry of Health and Welfare | 2026-07-23 |
| United States and territories | 988 Suicide & Crisis Lifeline, 24/7 call/text/chat | 988 | 988 Suicide & Crisis Lifeline | 2026-07-23 |

Official sources:

- Korea Ministry of Health and Welfare: <https://www.mohw.go.kr/menu.es?mid=a10716040000>
- 988 Lifeline: <https://988lifeline.org/get-help/>

## Refresh and incident rules

- Re-verify every contact from its official source within 30 days before launch and monthly after launch; immediately after any reported routing change.
- A failed or uncertain verification removes the specific number from runtime content while preserving generic local-emergency guidance.
- Keep source URL, verifier, date, changed fields, and reviewer approval in the decision log or release evidence.
- Do not expand to another region until a qualified owner verifies official resources, local wording, accessibility, and legal implications.
