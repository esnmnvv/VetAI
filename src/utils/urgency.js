const emergencyPattern =
  /экстренн|немедлен|срочно вызовите|срочно вызвать|вызовите ветеринара немедленно|сибирская язва|күйдүргү|шарп|ящур|внезапная смерть|күтүүсүз өлүм|дароо ветеринар|шашылыш чакыр/i;

const specialistPattern =
  /срочно|ветеринар|специалист|клиника|показать|обратиться|консультац|тез|адис|дарыгер|кайрыл|көрсөт|ветеринардын кеңеши/i;

export function detectUrgency(text = '') {
  if (emergencyPattern.test(text)) return 'emergency';
  if (specialistPattern.test(text)) return 'specialist';
  return 'low';
}
