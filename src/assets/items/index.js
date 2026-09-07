import backpack from './backpack.svg'
import books from './books.svg'
import charger from './charger.svg'
import headphones from './headphones.svg'
import idCard from './id-card.svg'
import keys from './keys.svg'
import laptop from './laptop.svg'
import earbuds from './earbuds.svg'
import notebook from './notebook.svg'
import umbrella from './umbrella.svg'
import calculator from './calculator.svg'
import watch from './watch.svg'
import glasses from './glasses.svg'
import penPencilCase from './pen-pencil-case.svg'
import usbDrive from './usb-drive.svg'
import accessCard from './access-card.svg'
import clothing from './clothing.svg'
import documents from './documents.svg'
import other from './other.svg'
import phone from './phone.svg'
import wallet from './wallet.svg'
import waterBottle from './water-bottle.svg'
import fallback from './fallback.svg'

export const DEMO_ITEM_IMAGES = [
  { id: 'id-card', label: 'ID card', src: idCard },
  { id: 'wallet', label: 'Wallet', src: wallet },
  { id: 'keys', label: 'Keys', src: keys },
  { id: 'phone', label: 'Phone', src: phone },
  { id: 'laptop', label: 'Laptop', src: laptop },
  { id: 'charger', label: 'Charger', src: charger },
  { id: 'earbuds', label: 'Earbuds', src: earbuds },
  { id: 'headphones', label: 'Headphones', src: headphones },
  { id: 'books', label: 'Books', src: books },
  { id: 'notebook', label: 'Notebook', src: notebook },
  { id: 'backpack', label: 'Backpack', src: backpack },
  { id: 'water-bottle', label: 'Water bottle', src: waterBottle },
  { id: 'umbrella', label: 'Umbrella', src: umbrella },
  { id: 'calculator', label: 'Calculator', src: calculator },
  { id: 'watch', label: 'Watch', src: watch },
  { id: 'glasses', label: 'Glasses', src: glasses },
  { id: 'pen-pencil-case', label: 'Pen / pencil case', src: penPencilCase },
  { id: 'usb-drive', label: 'USB drive', src: usbDrive },
  { id: 'access-card', label: 'College access card', src: accessCard },
  { id: 'clothing', label: 'Clothing', src: clothing },
  { id: 'documents', label: 'Documents', src: documents },
  { id: 'other', label: 'Other item', src: other },
]

export const FALLBACK_ITEM_IMAGE = fallback

export const DEMO_IMAGE_BY_CATEGORY = {
  'ID Card': idCard,
  Wallet: wallet,
  Keys: keys,
  Phone: phone,
  Laptop: laptop,
  Charger: charger,
  Earbuds: earbuds,
  Headphones: headphones,
  Books: books,
  Notebook: notebook,
  Backpack: backpack,
  'Water Bottle': waterBottle,
  Umbrella: umbrella,
  Calculator: calculator,
  Watch: watch,
  Glasses: glasses,
  'Pen/Pencil Case': penPencilCase,
  'USB Drive': usbDrive,
  'College Access Card': accessCard,
  Clothing: clothing,
  Documents: documents,
  Other: other,
}

export function getDemoImageForCategory(category) {
  return DEMO_IMAGE_BY_CATEGORY[category] || FALLBACK_ITEM_IMAGE
}

export function getReportImageUrl(report) {
  return report?.imageUrls?.find(Boolean) || getDemoImageForCategory(report?.itemCategory)
}

export function handleReportImageError(event, category) {
  const image = event.currentTarget
  if (image.dataset.fallbackApplied === 'true') {
    image.onerror = null
    image.src = FALLBACK_ITEM_IMAGE
    return
  }

  image.dataset.fallbackApplied = 'true'
  image.src = getDemoImageForCategory(category)
}