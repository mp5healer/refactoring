const calculateNewAmount = ({ performance, playType }) => {
  const defaultTragedyAmount = 40000;
  const defaultComedyAmount = 30000 + 300 * performance.audience;
  const playTypeAmount = {
    tragedy:
      performance.audience > 30
        ? defaultTragedyAmount + 1000 * (performance.audience - 30)
        : defaultTragedyAmount,
    comedy:
      performance.audience > 20
        ? defaultComedyAmount + 10000 + 500 * (performance.audience - 20)
        : defaultComedyAmount,
  };
  const amount = playTypeAmount[playType];
  if (amount) {
    return amount;
  } else {
    throw new Error(`unknown type: ${playType}`);
  }
};

const prepareNumberFormat = ({
  locale = "en-US",
  style = "currency",
  currency = "USD",
  minimumFractionDigits = 2,
} = {}) => {
  return new Intl.NumberFormat(locale, {
    style,
    currency,
    minimumFractionDigits,
  }).format;
};

const usd = (value) =>
  prepareNumberFormat({ style: "currency", currency: "USD" })(value);

const calculateVolumeCredits = ({ performance, playType }) => {
  const defaultVolumeCredits = Math.max(performance.audience - 30, 0);
  const playTypeVolumeCredits = {
    comedy: Math.floor(performance.audience / 5),
  };
  const playTypeCredit = playTypeVolumeCredits[playType]
    ? playTypeVolumeCredits[playType]
    : 0;
  return defaultVolumeCredits + playTypeCredit;
};

const getPlayDetails = ({ performance, plays }) => {
  const play = plays[performance.playID];
  const playType = play.type;
  const playName = play.name;
  return {
    playType,
    playName,
  };
};

export function newStatement(invoice, plays) {
  let result = `Statement for ${invoice.customer}\n`;
  const { totalAmount, volumeCredits } = invoice.performances.reduce(
    (newObj, performance) => {
      const { playType, playName } = getPlayDetails({ performance, plays });
      const amount = calculateNewAmount({
        performance,
        playType,
      });
      const volumeCredit = calculateVolumeCredits({ performance, playType });
      result += `  ${playName}: ${usd(amount / 100)} (${
        performance.audience
      } seats)\n`;
      return {
        totalAmount: newObj.totalAmount + amount,
        volumeCredits: newObj.volumeCredits + volumeCredit,
      };
    },
    { totalAmount: 0, volumeCredits: 0 }
  );
  result += `Amount owed is ${usd(totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits\n`;
  return result;
}
