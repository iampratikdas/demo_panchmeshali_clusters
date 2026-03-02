// utils/dateHelper.js
export function getRemainingDays(targetDate) {
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // in days
}

export function getNext30Days() {
  const today = new Date();
  const days = [];

  for (let i = 0; i < 30; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i);
    days.push(nextDay.toDateString()); // format: "Sat Aug 23 2025"
  }

  return days;
}
