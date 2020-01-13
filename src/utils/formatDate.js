// @flow
const dayName = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const monthName = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Nov',
  'Des',
];

const formatDate = (timestamp: number) => {
  if (!timestamp) {
    return '';
  }


  const datetime = new Date(timestamp * 1000);

  const day = dayName[datetime.getDay()];
  const month = monthName[datetime.getMonth()];

  // eslint-disable-next-line func-names
  const date = (function () {
    const d = datetime.getDate();
    const lastdigit = d % 100;
    if (lastdigit === 11 || lastdigit === 12 || lastdigit === 13) {
      return `${d}th`;
    }
    switch (lastdigit) {
    case 1:
      return `${d}st`;
    case 2:
      return `${d}nd`;
    case 3:
      return `${d}rd`;
    default:
      break;
    }


    return `${d}th`;
  }());


  const year = datetime.getUTCFullYear();
  return `${day}, ${month} ${date} ${year}`;
};

export default formatDate;
