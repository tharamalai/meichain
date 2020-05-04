import useAxios from 'axios-hooks'

export const useMeiBalance = (meiAddress) => {
  return useAxios(
    `http://localhost:8010/bank/balances/${meiAddress}`,
  )
}