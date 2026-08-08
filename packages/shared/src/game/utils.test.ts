import { validateRatingRange } from "./utils"

describe("Shared Utils", () => {
    test("Rating range validation", () => {
        expect(validateRatingRange(-100, 100)).toBe(true)
        expect(validateRatingRange(-101, 100)).toBe(false)
        expect(validateRatingRange(0, 400)).toBe(true)
        expect(validateRatingRange(201, 400)).toBe(false)
        expect(validateRatingRange(-400, 400)).toBe(true)
        expect(validateRatingRange(-200, 0)).toBe(false)
    })
})
