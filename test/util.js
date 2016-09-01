describe('Utilities', () => {
  describe('Random', () => {

    let rng
    beforeEach(() => {
      rng_alea = new lab.util.Random({
        algorithm: 'alea',
        seed: 'abcd'
      })

      rng_random = new lab.util.Random()
    })

    it('provides random floating point numbers', () => {
      assert.closeTo(
        rng_alea.random(),
        0.7154429776128381,
        Math.pow(10, -16)
      )

      assert.closeTo(
        rng_alea.random(),
        0.8120661831926554,
        Math.pow(10, -16)
      )

      assert.typeOf(
        rng_random.random(),
        'number'
      )
    })

    it('provides integers within a given range', () => {
      assert.deepEqual(
        [1, 2, 3, 4, 5, 6, 7].map(() => rng_alea.range(10)),
        [7, 8, 8, 4, 2, 2, 9]
      )

      assert.typeOf(
        rng_random.range(10),
        'number'
      )

      assert.ok(
        0 <=rng_random.range(10) && rng_random.range(10) < 10
      )
    })

    it('provides random samples from an array', () => {
      const array = [1, 2, 3]
      assert.deepEqual(
        [1, 2, 3, 4].map(() => rng_alea.sample(array)),
        [3, 3, 3, 2]
      )

      assert.ok(
        array.includes(rng_random.sample(array))
      )
    })

    it('shuffles an array', () =>{
      const array = [1, 2, 3, 4, 5]
      assert.deepEqual(
        rng_alea.shuffle(array),
        [2, 1, 3, 5, 4]
      )

      assert.ok(
        rng_random
          .shuffle(array)
          .every(x => array.includes(x))
      )
    })

    it('does not modify the array while shuffling it', () => {
      const array = [1, 2, 3, 4, 5]
      rng_alea.shuffle(array)
      assert.deepEqual(
        array,
        [1, 2, 3, 4, 5]
      )
    })

    it('generates a random v4 uuid', () => {
      assert.equal(
        rng_alea.uuid4(),
        'bcd644f6-0ee1-4006-bb7b-70dfdcef7c41'
      )
      assert.match(
        rng_random.uuid4(),
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[8-9a-b][0-9a-f]{3}-[0-9a-f]{12}$/
      )
    })

  })
})
