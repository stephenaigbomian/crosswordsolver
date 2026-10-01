export interface SampleDataset {
  id: string;
  name: string;
  description: string;
  csvContent: string;
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'geography',
    name: 'World Geography',
    description: 'Countries and capital cities around the globe',
    csvContent: `Answer, Clue
PARIS, Capital of France known as the City of Light
TOKYO, Capital of Japan and bustling metropolis
LONDON, Capital of the United Kingdom with the Big Ben
MADRID, Capital of Spain famous for the Prado Museum
ROME, Ancient capital of Italy with the Colosseum
BERLIN, Capital of Germany with the historic gate
OTTAWA, Capital city of Canada
CAIRO, Capital of Egypt near the ancient Giza pyramids
CANBERRA, Planned capital city of Australia
BRASILIA, Futurist capital city of Brazil`,
  },
  {
    id: 'animals',
    name: 'Animals & Wildlife',
    description: 'Fascinating creatures of the wild',
    csvContent: `Answer, Clue
ELEPHANT, Large mammal with distinctive trunk and tusks
GIRAFFE, Tallest living terrestrial animal with long neck
PENGUIN, Flightless bird adapted for swimming in Antarctica
DOLPHIN, Intelligent aquatic mammal known for playful clicks
CHEETAH, Fastest land animal on Earth
KANGAROO, Australian marsupial with powerful hind legs
PANDA, Bear native to south-central China that eats bamboo
OCTOPUS, Sea creature with eight arms and high intelligence
FLAMINGO, Pink wading bird often seen standing on one leg
ZEBRA, African wild horse known for its black and white stripes`,
  },
  {
    id: 'tech',
    name: 'Tech & Computing',
    description: 'Software, hardware, and digital concepts',
    csvContent: `Answer, Clue
CANVA, Popular visual design and publishing platform
REACT, Declarative JavaScript library for user interfaces
PYTHON, High-level programming language named after a comedy group
BROWSER, Application used to access the World Wide Web
SERVER, Computer providing data or services to network clients
DATABASE, Structured set of data held in a computer
PIXEL, Smallest addressable element in a digital image
ALGORITHM, Step-by-step procedure for solving a computational problem
ROUTER, Network device forwarding data packets between networks
COOKIE, Small block of data stored on a computer by web browsers`,
  },
  {
    id: 'food',
    name: 'Food & Culinary',
    description: 'Delicious ingredients and famous dishes',
    csvContent: `Answer, Clue
PIZZA, Italian dish topped with tomato sauce and melted cheese
PASTA, Italian staple food made from durum wheat flour
SUSHI, Japanese delicacy of seasoned rice with raw seafood
CHOCOLATE, Sweet treat derived from roasted cacao beans
AVOCADO, Creamy pear-shaped fruit popular for toast and guacamole
PANCAKE, Flat round cake cooked in a frying pan
TACO, Mexican dish of a folded tortilla filled with meat and salsa
CHEESE, Dairy product made from pressed milk curds
HONEY, Sweet golden liquid made by bees from flower nectar
COFFEE, Popular caffeinated beverage brewed from roasted beans`,
  },
];
