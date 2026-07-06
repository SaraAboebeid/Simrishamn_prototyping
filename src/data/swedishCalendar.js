/**
 * Swedish public holidays and notable tourism periods for 2024.
 * Each entry has: key, label, dates (YYYY-MM-DD array), color hint.
 */

export const HOLIDAYS_2024 = [
  { key: 'nyttarsdagen',          label: 'Nyarsdagen',             dates: ['2024-01-01'] },
  { key: 'trettondedag_jul',      label: 'Trettondedag jul',       dates: ['2024-01-06'] },
  { key: 'langfredagen',          label: 'Langfredagen',           dates: ['2024-03-29'] },
  { key: 'paskdagen',             label: 'Paskdagen',              dates: ['2024-03-31'] },
  { key: 'annandag_pask',         label: 'Annandag pask',          dates: ['2024-04-01'] },
  { key: 'forsta_maj',            label: 'Forsta maj',             dates: ['2024-05-01'] },
  { key: 'kristi_himmelsfardsdag',label: 'Kristi himmelsfardsdag', dates: ['2024-05-09'] },
  { key: 'pingstdagen',           label: 'Pingstdagen',            dates: ['2024-05-19'] },
  { key: 'nationaldagen',         label: 'Sveriges nationaldag',   dates: ['2024-06-06'] },
  { key: 'midsommardagen',        label: 'Midsommardagen',         dates: ['2024-06-22'] },
  { key: 'alla_helgons_dag',      label: 'Alla helgons dag',       dates: ['2024-11-02'] },
  { key: 'juldagen',              label: 'Juldagen',               dates: ['2024-12-25'] },
  { key: 'annandag_jul',          label: 'Annandag jul',           dates: ['2024-12-26'] },
]

// Long weekends: holiday + surrounding days that form 3–4 day breaks
export const LONG_WEEKENDS_2024 = [
  { key: 'pask_lw',          label: 'Pask langhelg',             dates: ['2024-03-29','2024-03-30','2024-03-31','2024-04-01'] },
  { key: 'himmelsfard_lw',   label: 'Kristi himmelsfards-LH',    dates: ['2024-05-09','2024-05-10','2024-05-11','2024-05-12'] },
  { key: 'midsommar_lw',     label: 'Midsommar langhelg',        dates: ['2024-06-21','2024-06-22','2024-06-23'] },
  { key: 'alla_helgona_lw',  label: 'Alla helgona langhelg',     dates: ['2024-11-01','2024-11-02','2024-11-03'] },
  { key: 'jul_lw',           label: 'Jul langhelg',              dates: ['2024-12-24','2024-12-25','2024-12-26','2024-12-27','2024-12-28','2024-12-29'] },
]

export const SEASONS_2024 = [
  { key: 'winter', label: 'Vinter',  months: [12, 1, 2],  color: '#38BDF8' },
  { key: 'spring', label: 'Vår',     months: [3, 4, 5],   color: '#4ADE80' },
  { key: 'summer', label: 'Sommar',  months: [6, 7, 8],   color: '#FF6B35' },
  { key: 'autumn', label: 'Höst',    months: [9, 10, 11], color: '#F59E0B' },
]

export const MONTH_NAMES = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec',
]

export const DOW_NAMES = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

// Build a Set of all holiday dates for quick lookup
export const HOLIDAY_DATE_SET = new Set(
  HOLIDAYS_2024.flatMap(h => h.dates)
)

export function isHoliday(dateStr) {
  return HOLIDAY_DATE_SET.has(dateStr)
}

export function isWeekend(dow) {
  return dow === 5 || dow === 6  // Sat, Sun
}
