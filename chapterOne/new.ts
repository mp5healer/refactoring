const calculateNewAmount = ({ audience, playType }) => {
  const defaultTragedyAmount = 40000;
  const defaultComedyAmount = 30000 + 300 * audience;
  const playTypeAmount = {
    tragedy:
      audience > 30
        ? defaultTragedyAmount + 1000 * (audience - 30)
        : defaultTragedyAmount,
    comedy:
      audience > 20
        ? defaultComedyAmount + 10000 + 500 * (audience - 20)
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

const calculateVolumeCredits = ({ audience, playType }) => {
  const defaultVolumeCredits = Math.max(audience - 30, 0);
  const playTypeVolumeCredits = {
    comedy: Math.floor(audience / 5),
  };
  const playTypeCredit = playTypeVolumeCredits[playType]
    ? playTypeVolumeCredits[playType]
    : 0;
  return defaultVolumeCredits + playTypeCredit;
};

const getPlayDetails = ({ key, plays }) => {
  const play = plays[key];
  const playType = play.type;
  const playName = play.name;
  return {
    playType,
    playName,
  };
};

const getInvoiceDetails = ({ invoice }) => {
  return {
    invoiceCustomer: invoice.customer,
    performances: invoice.performances,
  };
};

const getPerformanceDetails = ({ performance }) => {
  return {
    performancePlayID: performance.playID,
    performanceAudience: performance.audience,
  };
};

const calculateTotalAmount = ({ performances, plays }) => {
  const totalAmount = performances.reduce((total, performance) => {
    const { performanceAudience: audience, performancePlayID: key } =
      getPerformanceDetails({
        performance,
      });
    const { playType } = getPlayDetails({
      key,
      plays,
    });
    const amount = calculateNewAmount({
      audience,
      playType,
    });
    return total + amount;
  }, 0);
  return totalAmount;
};

const calculateTotalVolumeCredits = ({ performances, plays }) => {
  const volumeCredits = performances.reduce((total, performance) => {
    const { performanceAudience: audience, performancePlayID: key } =
      getPerformanceDetails({
        performance,
      });
    const { playType } = getPlayDetails({
      key,
      plays,
    });
    const volumeCredit = calculateVolumeCredits({ audience, playType });
    return total + volumeCredit;
  }, 0);
  return volumeCredits;
};

const renderPlainText = ({ invoiceCustomer, performances, plays }) => {
  const totalAmount = calculateTotalAmount({ performances, plays });
  const volumeCredits = calculateTotalVolumeCredits({ performances, plays });
  let result = `Statement for ${invoiceCustomer}\n`;
  performances.forEach((performance) => {
    const { performanceAudience: audience, performancePlayID } =
      getPerformanceDetails({
        performance,
      });
    const { playType, playName } = getPlayDetails({
      key: performancePlayID,
      plays,
    });
    const amount = calculateNewAmount({
      audience,
      playType,
    });
    result += `  ${playName}: ${usd(amount / 100)} (${audience} seats)\n`;
  });
  result += `Amount owed is ${usd(totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits\n`;
  return result;
};

export function newStatement(invoice, plays) {
  const { invoiceCustomer, performances } = getInvoiceDetails({ invoice });
  return renderPlainText({ invoiceCustomer, performances, plays });
}
