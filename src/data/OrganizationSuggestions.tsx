// @ts-expect-error
const usNASDAQTop100 = [
    "Palantir Technologies Inc","MicroStrategy (Strategy)","Axon Enterprise Inc","Applovin Corp", "Arm Holdings PLC",
    "Linde PLC","AstraZeneca PLC","Baker Hughes Co","Broadcom Inc","Biogen Inc", "Booking Holdings Inc",
    "Cadence Design Systems Inc","Adobe Inc.","Charter Communications Inc", "Copart Inc","CoStar Group Inc",
    "CrowdStrike Holdings Inc","Cintas Corp","Cisco Systems Inc", "Comcast Corp","Costco Wholesale Corp",
    "CSX Corp","Cognizant Technology Solutions Corp", "Datadog Inc","Dexcom Inc","Diamondback Energy Inc",
    "Electronic Arts","ON Semiconductor Corp", "Exelon Corp","Trade Desk Inc","Fastenal Co","GlobalFoundries Inc",
    "Meta Platforms Inc","Fiserv Inc", "Fortinet Inc","Gilead Sciences Inc","Alphabet Class C","Alphabet Class A",
    "Honeywell International Inc", "Intel Corp","Intuit Inc","Intuitive Surgical Inc","Marvell Technology Inc",
    "IDEXX Laboratories Inc","Shopify Inc","Keurig Dr Pepper Inc","KLA Corp","Kraft Heinz Co","Lam Research Corp",
    "Lululemon Athletica Inc","MercadoLibre Inc","Marriott International Inc","Microchip Technology Inc",
    "Mondelez International Inc","Monster Beverage Corp","Microsoft Corp","Micron Technology Inc","Netflix Inc",
    "Grail Inc","NVIDIA Corp","NXP Semiconductors NV","Old Dominion Freight Line Inc","O’Reilly Automotive Inc",
    "Paccar Inc","Palo Alto Networks Inc","Paychex Inc","PDD Holdings Inc","PayPal Holdings Inc","PepsiCo Inc.",
    "Qualcomm Inc","Regeneron Pharmaceuticals Inc","Ross Stores Inc","Starbucks Corp","Synopsys Inc","Tesla Inc",
    "Texas Instruments Inc","T-Mobile US Inc","Verisk Analytics Inc","Vertex Pharmaceuticals Inc","Warner Bros Discovery Inc",
    "Workday Inc","Xcel Energy Inc","Zscaler Inc","Automatic Data Processing Inc","Airbnb Inc","Advanced Micro Devices Inc",
    "Constellation Energy Corp","Amazon","Amgen Inc","American Electric Power Company Inc","CDW Corp",
    "Coca-Cola Europacific Partners PLC","Analog Devices Inc","DoorDash Inc","Roper Technologies Inc","ANSYS Inc",
    "Apple Inc","Applied Materials Inc","GE Healthcare Technologies Inc","ASML Holding NV","Atlassian Corp",
    "Autodesk Inc"
]

const usNASDAQTop100WithoutIncOrCompanySufffix = [
    "Palantir Technologies","MicroStrategy (Strategy)","Axon Enterprise","Applovin","Arm Holdings","Linde","AstraZeneca",
    "Baker Hughes","Broadcom","Biogen","Booking Holdings","Cadence Design Systems","Adobe","Charter Communications",
    "Copart","CoStar Group","CrowdStrike Holdings","Cintas","Cisco Systems","Comcast","Costco Wholesale","CSX",
    "Cognizant Technology Solutions","Datadog","Dexcom","Diamondback Energy","Electronic Arts","ON Semiconductor",
    "Exelon","Trade Desk","Fastenal","GlobalFoundries","Meta Platforms","Fiserv","Fortinet","Gilead Sciences",
    "Alphabet Class C","Alphabet Class A","Honeywell International","Intel","Intuit","Intuitive Surgical",
    "Marvell Technology","IDEXX Laboratories","Shopify","Keurig Dr Pepper","KLA","Kraft Heinz","Lam Research",
    "Lululemon Athletica","MercadoLibre","Marriott International","Microchip Technology","Mondelez International",
    "Monster Beverage","Microsoft","Micron Technology","Netflix","Grail","NVIDIA","NXP Semiconductors",
    "Old Dominion Freight Line","O’Reilly Automotive","Paccar","Palo Alto Networks","Paychex","PDD Holdings",
    "PayPal Holdings","PepsiCo","Qualcomm","Regeneron Pharmaceuticals","Ross Stores","Starbucks","Synopsys","Tesla",
    "Texas Instruments","T-Mobile US","Verisk Analytics","Vertex Pharmaceuticals","Warner Bros Discovery","Workday",
    "Xcel Energy","Zscaler","Automatic Data Processing","Airbnb","Advanced Micro Devices","Constellation Energy",
    "Amazon","Amgen","American Electric Power","CDW","Coca-Cola Europacific Partners","Analog Devices",
    "DoorDash","Roper Technologies","ANSYS","Apple","Applied Materials","GE Healthcare Technologies","ASML Holding",
    "Atlassian","Autodesk"
]

// TODO: Implment these later.
// const usRestOfNASDAQ= []
// const euOrgs = []
// const asiaOrgs = []
// const middleEastAfricaOrgs = []
// const wellKnownPrivateOrgs = []

const miscOrgs = ['Google', 'Meta', 'Tesla', 'Facebook', 'Instagram', 'YouTube', 'LinkedIn', 
    'Uber', 'Airbnb', 'Spotify', 'Nike', 'Adidas', 'Coca-Cola', 'Pepsi', 'McDonald\'s', 
    'Walmart', 'Target', 'Home Depot', 'Best Buy', 'GameStop', 'AMC', 'Disney', 'Warner Bros', 
    'EA Sports', 'Activision', 'Blizzard', 'Ford', 'General Motors', 'JPMorgan Chase', 
    'Bank of America','General Motors', 'Wells Fargo', 'Goldman Sachs', 'Visa', 'Mastercard', 
    'PayPal', 'Square', 'Robinhood', 'Coinbase', 'Binance']

// These ones could potential need a different source than fec.gov for finanical contributions.
const miscOrgsInternational = ['Sony', 'Nintendo', 'Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi']


const organizationSuggestions = [...usNASDAQTop100WithoutIncOrCompanySufffix, ...miscOrgs, ...miscOrgsInternational];


export default organizationSuggestions;