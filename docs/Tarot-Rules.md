# Tarot Rules

Status: Domain engine and question UI implemented; persistence/manual-entry UI pending

## Deck

The canonical MVP deck has 78 stable card IDs: 22 Major Arcana and 56 Minor Arcana across Wands, Cups, Swords, and Pentacles. Each card stores bilingual names, number/rank, suit, upright/reversed keywords, reflective prompts, and safety-safe interpretations. Editorial copy is licensed or original.

## Draw invariants

- The draw engine—not AI—chooses cards and orientation.
- A cryptographically secure random source is used for ordinary draws.
- Regression/demo draws accept an explicit seed.
- Audit data stores deck version, spread version, seed commitment or random event ID, draw order, orientation setting, timestamp, and algorithm version.
- Sampling is without replacement within a reading.
- Retry with the same idempotency key returns the original draw.

Implemented algorithm: `mulberry32-fisher-yates-1.0.0`. A secure random 128-bit seed is created for ordinary draws; an explicit seed enables exact replay for tests and audits. The seed, deck version, spread version, algorithm version, and derived event ID are returned with each engine reading.

## Spreads

- One card: focus.
- Three card: context / tension / next constructive step.
- Work, relationship, money, emotion, daily choice, and free-question variants use named positions.
- Reversals can be disabled by user preference.
- Users can enter physical card results; source is marked `manual`, never `engine_draw`.

## Interpretation

The pipeline supplies selected cards, positions, orientation, canonical meanings, numerology facts, and consented context to AI. AI may synthesize combinations but cannot add, remove, reorder, or flip a card. Responses cover symbol, user connection, positive/risk factors, reality checks, choice criteria, small action, uncertainty, and decision ownership.

Implemented combination rules report only observable structural features: Major Arcana density, repeated suits, and repeated ranks. They ask reflective questions and do not manufacture predictions.

## Safety

Cards never determine a medical, legal, investment, self-harm, violence, or crime outcome. High-risk questions receive reality-first guidance before any optional symbolic reflection.
