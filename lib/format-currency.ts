export function formatKoreanCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "0원"
  }

  const absAmount = Math.abs(amount)

  if (absAmount >= 100000000) {
    // 억 단위
    const eok = Math.floor(absAmount / 100000000)
    const remainder = absAmount % 100000000

    if (remainder >= 10000) {
      const man = Math.floor(remainder / 10000)
      return `${amount < 0 ? "-" : ""}${eok}억 ${man}만원`
    } else if (remainder > 0) {
      return `${amount < 0 ? "-" : ""}${eok}억 ${remainder.toLocaleString()}원`
    } else {
      return `${amount < 0 ? "-" : ""}${eok}억원`
    }
  } else if (absAmount >= 10000) {
    // 만 단위
    const man = Math.floor(absAmount / 10000)
    const remainder = absAmount % 10000

    if (remainder > 0) {
      return `${amount < 0 ? "-" : ""}${man}만 ${remainder.toLocaleString()}원`
    } else {
      return `${amount < 0 ? "-" : ""}${man}만원`
    }
  } else {
    // 만 미만
    return `${amount < 0 ? "-" : ""}${absAmount.toLocaleString()}원`
  }
}

export function formatSimpleKoreanCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "0원"
  }

  const absAmount = Math.abs(amount)

  if (absAmount >= 100000000) {
    const eok = (absAmount / 100000000).toFixed(1)
    return `${amount < 0 ? "-" : ""}${eok}억원`
  } else if (absAmount >= 10000) {
    const man = (absAmount / 10000).toFixed(1)
    return `${amount < 0 ? "-" : ""}${man}만원`
  } else {
    return `${amount < 0 ? "-" : ""}${absAmount.toLocaleString()}원`
  }
}
