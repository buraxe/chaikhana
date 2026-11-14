/** English clue bank: words and clues for the crossword and anagrams. */
export const CLUES_EN = `
paris: Capital of France
london: City on the Thames
rome: City of seven hills
tokyo: Capital of Japan
egypt: Country of the pyramids
ocean: Vast body of salt water
river: It flows to the sea
lake: Inland body of water
mountain: Very high hill
desert: Dry, sandy region
island: Land surrounded by water
forest: Large area covered with trees
valley: Low land between hills
sun: Star at the centre of our solar system
moon: Earth's natural satellite
star: Twinkler in the night sky
cloud: White puff in the sky
rain: Water falling from clouds
snow: White winter flakes
wind: Moving air
storm: Weather with thunder and lightning
thunder: Rumble after lightning
rainbow: Arc of colours after rain
apple: Fruit said to have fallen on Newton
banana: Long yellow fruit
cherry: Small red stone fruit
grape: It grows in bunches on a vine
lemon: Sour yellow citrus
orange: Citrus named after its colour
peach: Fuzzy summer fruit
melon: Large juicy fruit with many seeds
bread: Baked loaf
cheese: Food made from milk curds
butter: Spread churned from cream
honey: Sweet food made by bees
sugar: Sweetener in your tea
salt: Seasoning from the sea
soup: Liquid starter, often served hot
pizza: Italian dish with tomato and cheese
rice: Grain eaten all over Asia
tea: Drink brewed from leaves
coffee: Morning drink from roasted beans
milk: White drink from cows
cat: Pet that purrs
dog: Pet that barks
horse: Animal with a mane and hooves
cow: Farm animal that moos
sheep: Animal kept for its wool
goat: Bearded climbing animal
lion: King of the jungle
tiger: Striped big cat
elephant: Animal with a trunk
bear: Animal that sleeps through winter
wolf: Animal that howls at the moon
fox: Sly animal with a bushy tail
rabbit: Long-eared hopper
eagle: Large bird of prey
owl: Wise night bird
parrot: Bird that can talk
penguin: Bird that swims but cannot fly
fish: It breathes through gills
whale: Largest animal on Earth
dolphin: Clever sea mammal
shark: Sea predator with sharp teeth
bee: Insect that makes honey
ant: Tiny hard-working insect
spider: Eight-legged web spinner
school: Place where pupils learn
teacher: Person who gives lessons
book: Pages bound together
pencil: Writing tool with lead
paper: Sheet you write on
desk: Table you work at
chair: Seat with a back
door: You open it to go in
window: Glass opening in a wall
key: It opens a lock
clock: It tells the time
mirror: Glass that reflects
bed: Where you sleep
lamp: It gives light
phone: Device for calling
car: Vehicle with four wheels
ship: Large boat
plane: It flies passengers
train: It runs on rails
bicycle: Two wheels and pedals
bridge: It crosses a river
street: Road in a town
city: Large town
village: Small country settlement
house: Building you live in
garden: Place where flowers grow
flower: Colourful part of a plant
rose: Flower with thorns
tulip: Spring flower loved in Holland and Istanbul
daisy: Small white flower with a yellow centre
tree: Tall plant with a trunk
leaf: Green part of a tree
seed: A plant grows from it
hand: It has five fingers
eye: Organ of sight
ear: Organ of hearing
nose: Organ of smell
heart: Organ that pumps blood
tooth: You chew with it
hair: It grows on your head
mother: Female parent
father: Male parent
sister: Female sibling
brother: Male sibling
friend: Someone you like and trust
music: Art of sound
song: Music with words
guitar: Six-stringed instrument
drum: Instrument you beat
piano: Instrument with black and white keys
violin: Instrument played with a bow
painting: Picture made with brushes
theatre: Place where plays are staged
cinema: Place to watch films
football: Game for two teams of eleven
chess: Game of kings and queens
tennis: Sport with rackets and a net
monday: First day of the working week
january: First month of the year
april: Month of spring showers
summer: Warmest season
winter: Coldest season
spring: Season of blossoms
morning: Start of the day
evening: End of the day
night: The dark hours
red: Colour of blood
blue: Colour of the sky
green: Colour of grass
yellow: Colour of a lemon
white: Colour of snow
black: Colour of coal
happy: Full of joy
quick: Fast
large: Big
pretty: Lovely to look at
cold: Not hot
old: Not new
tall: Not short
doctor: Person who treats the sick
chef: Cook in a restaurant
pilot: Person who flies a plane
farmer: Person who grows crops
king: Ruler of a kingdom
queen: A king's wife, or a ruler herself
story: Tale
dream: What you see while sleeping
world: Our planet
map: Drawing of the land
compass: It points north
treasure: Buried riches
hope: Wish for something good
love: Deep affection
peace: Opposite of war
smile: Happy face
laugh: Sound of amusement
`;

export const SEARCH_EN: { name: { en: string; zh: string; tr: string }; words: string[] }[] = [
  { name: { en: 'Animals', zh: '动物', tr: 'Hayvanlar' }, words: 'lion tiger cat dog rabbit fox wolf bear zebra giraffe eagle dolphin'.split(' ') },
  { name: { en: 'Fruit', zh: '水果', tr: 'Meyveler' }, words: 'apple pear cherry grape fig melon lemon banana plum peach mango kiwi'.split(' ') },
  { name: { en: 'Colours', zh: '颜色', tr: 'Renkler' }, words: 'red blue green yellow white black purple orange pink grey brown navy'.split(' ') },
  { name: { en: 'Cities', zh: '城市', tr: 'Şehirler' }, words: 'paris london rome tokyo berlin madrid cairo lima oslo dublin vienna delhi'.split(' ') },
  { name: { en: 'Jobs', zh: '职业', tr: 'Meslekler' }, words: 'doctor chef pilot farmer lawyer tailor barber nurse police soldier builder painter'.split(' ') },
  { name: { en: 'Kitchen', zh: '厨房', tr: 'Mutfak' }, words: 'plate spoon fork knife glass pot pan oven kettle jug ladle grater'.split(' ') },
  { name: { en: 'Nature', zh: '自然', tr: 'Doğa' }, words: 'sea river lake hill forest field island valley cloud rain wind waterfall'.split(' ') },
  { name: { en: 'Instruments', zh: '乐器', tr: 'Çalgılar' }, words: 'guitar violin piano drum flute harp oboe cello trumpet banjo organ lute'.split(' ') },
];
