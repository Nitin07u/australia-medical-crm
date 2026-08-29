export interface Charm {
  id: string;
  name: string;
  region: string;
  description: string;
  buttonLabel: string;
  image: string;
  ritual?: string;
}

export const charms: Charm[] = [
  {
    id: 'nazar',
    name: 'Nazar boncuğu',
    region: 'TURKEY AND THE MEDITERRANEAN',
    description:
      'A glass eye worn against the evil eye. Give it a flick when you want a little cover.',
    buttonLabel: 'Give it a flick',
    image: '/charms/nazar.png',
    ritual: 'flick',
  },
  {
    id: 'hamsa',
    name: 'Hamsa',
    region: 'MIDDLE EAST AND NORTH AFRICA',
    description:
      'An open hand carried for protection and good fortune. Give it a flick to send bad luck on its way.',
    buttonLabel: 'Give it a flick',
    image: '/charms/hamsa.png',
    ritual: 'flick',
  },
  {
    id: 'nimbu-mirchi',
    name: 'Nimbu-mirchi',
    region: 'INDIA',
    description:
      'Seven chilies and a lemon hung at the threshold to turn away misfortune. Replace it with a fresh one when the week is up.',
    buttonLabel: 'Hang a fresh garland',
    image: '/charms/nimbu-mirchi.png',
    ritual: 'garland',
  },
  {
    id: 'ghanta',
    name: 'Ghanta',
    region: 'INDIA',
    description:
      'A bell rung to clear the air and mark a beginning. Ring it when you make a wish, or before something that matters.',
    buttonLabel: 'Ring the bell',
    image: '/charms/ghanta.png',
    ritual: 'ring',
  },
  {
    id: 'drishti-bommai',
    name: 'Drishti bommai',
    region: 'SOUTH INDIA',
    description:
      'A fierce guardian painted to meet the first bad glance. Repaint it through seven colors whenever you want a fresh start.',
    buttonLabel: 'Repaint the guardian',
    image: '/charms/drishti-bommai.png',
    ritual: 'repaint',
  },
  {
    id: 'panchang-jie',
    name: 'Páncháng jié',
    region: 'CHINA',
    description:
      'One unbroken red cord tied for good fortune without end. Cinch it gently and let the tassel settle.',
    buttonLabel: 'Tie in good fortune',
    image: '/charms/panchang-jie.png',
    ritual: 'tie',
  },
  {
    id: 'daruma',
    name: 'Daruma',
    region: 'JAPAN',
    description:
      'A wishing doll for goals that take some grit. Paint one eye when you make a wish and the other when it comes true.',
    buttonLabel: 'Make a wish',
    image: '/charms/daruma.png',
    ritual: 'wish',
  },
  {
    id: 'maneki-neko',
    name: 'Maneki-neko',
    region: 'JAPAN',
    description:
      'A beckoning cat that invites good fortune in. Call on it and watch its raised paw wave.',
    buttonLabel: 'Beckon good fortune',
    image: '/charms/maneki-neko.png',
    ritual: 'beckon',
  },
  {
    id: 'horseshoe',
    name: 'Horseshoe',
    region: 'EUROPE AND THE AMERICAS',
    description:
      'Hung points up so the luck stays put. A good flick is all this one needs.',
    buttonLabel: 'Give it a flick',
    image: '/charms/horseshoe.png',
    ritual: 'flick',
  },
  {
    id: 'scarab',
    name: 'Scarab',
    region: 'ANCIENT EGYPT',
    description:
      'An ancient amulet for renewal and new beginnings. Spread its ceremonial wings for a moment, then let them rest.',
    buttonLabel: 'Spread the wings',
    image: '/charms/scarab.png',
    ritual: 'wings',
  },
  {
    id: 'himmeli',
    name: 'Himmeli',
    region: 'FINLAND',
    description:
      'A rye-straw tradition for inviting abundance, prosperity, and a fruitful flow of work. Set its open geometry turning on an imagined current of air.',
    buttonLabel: 'Set it turning',
    image: '/charms/himmeli.png',
    ritual: 'turn',
  },
  {
    id: 'emoji',
    name: 'Emoji',
    region: 'YOURS',
    description:
      'Choose any emoji and make the ritual your own. Hang the one that feels lucky to you.',
    buttonLabel: 'Pick an emoji',
    image: '/charms/emoji.png',
    ritual: 'emoji',
  },
];
