import { assert, describe, it } from 'vitest'
import { timeSafeCompare } from '../src/utils'

describe('timeSafeCompare() test', () => {
  it('should return true for the same value', () => {
    const value = 'qsLPe4XsiY2nxXvaD9fWsUXT65psYCoE'
    const result = timeSafeCompare(value, value)
    assert.equal(result, true)
  })

  it('should return false without failing', () => {
    const valueA = 'qsLPe4XsiY2nxXvaD9fWsUXT65psYCoE'
    const valueB = 'R9qyjzGA8b6xz25kGQTBph65Na3WW57j'
    const result = timeSafeCompare(valueA, valueB)
    assert.equal(result, false)
  })

  it('should return false without failing', () => {
    const valueA = 'R9qyjzGA8b6xz25kG'
    const valueB = 'XsiY2nxXvaD9fWsUXT65psYCoE'
    const result = timeSafeCompare(valueA, valueB)
    assert.equal(result, false)
  })
})
