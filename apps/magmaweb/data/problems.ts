export const problems = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  image: `/problems/sample${(i % 5) + 1}.jpg`,
}))

