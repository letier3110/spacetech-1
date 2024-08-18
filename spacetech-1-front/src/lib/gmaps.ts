export const generateGmapsLink = (address: string) => {
  const domain = 'https://www.google.com/maps/search/'
  const encodedAddress = encodeURIComponent(address)
  const staticCoordinates = '51.5225743,30.6769662,13z'
  return `${domain}${encodedAddress}/@${staticCoordinates}?entry=ttu`
}