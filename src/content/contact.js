// src/content/contact.js
export const contact = {
  title: 'Contact IAS & Co.',
  sub: 'For professional queries regarding audit, taxation, or compliance, please reach out to one of our offices.',

  // single source of truth for firm name shown in headers/logos
  org: 'I A S & Co.',
  tagline: 'Chartered Accountants',
  // optional convenience if you need a single string
  displayName: 'I A S & Co. — Chartered Accountants',

  // Global contact info (used in footer and CTAs)
  phone: '+91 89800 09157',
  email: 'admin@iasandco.in',
  emailAlt: 'iasandco@icai.org',
  address:
    'Second Floor, Platinum Landmark Complex, Himatnagar - Vijapur Hwy, nr. Prabhat Heart and Gynec Hospital, Brahmani Nagar, Husainabad, Rangpur Village, Mehtapura, Savgadh, Himatnagar, Gujarat 383220',
  mapUrl:
    'https://www.google.com/maps/dir//Second+Floor,+I+A+S+and+Co,+Platinum+Landmark+Complex,+Himatnagar+-+Vijapur+Hwy,+nr.+Prabhat+Heart+and+Gynec+Hospital,+Brahmani+Nagar,+Savgadh,+Himatnagar,+Gujarat+383220/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0x395db9dfcda5a67d:0xbf0cbc6e2d69c23f?sa=X&ved=1t:57443&ictx=111',
  officeTime: 'Mon–Sat · 10:00–18:30 IST',
};

export const branches = [
  {
    name: 'Head Office',
    address: 'Platinum Landmark, Himmatnagar – 383001, Gujarat',
    phone: '+91 94090 45477',
    email: 'iasandco@icai.org',
    hours: 'Mon–Sat · 10:00–18:30 IST',
    contactPerson: 'CA Hamidakhatan Sheth',
    mapUrl: 'https://maps.google.com/?q=Platinum+Landmark,+Himmatnagar+383001',
    photo: require('../../assets/team/hamida.png')
  },
  {
    name: 'Branch Office · Ahmedabad',
    address: 'Ganesh Glory-11, Near BSNL Office, Jagatpur, Ahmedabad – 382470',
    phone: '+91 98255 06700',
    email: 'irshad_sabugar@yahoo.co.in',
    hours: 'Mon–Sat · 10:00–18:30 IST',
    contactPerson: 'CA Irshad Sabugar',
    mapUrl: 'https://maps.google.com/?q=Ganesh+Glory-11,+Jagatpur,+Ahmedabad+382470',
    photo: require('../../assets/team/irshad.png')
  },
  {
    name: 'Branch Office · Prantij',
    address: 'Shop 1–4, Famous Complex, Near Heritage Hotel, NH 48, Prantij – 383205',
    phone: '+91 93750 46369',
    email: 'hashmi.maulvi@yahoo.co.in',
    hours: 'Mon–Sat · 10:00–18:30 IST',
    contactPerson: 'CA Hashmi Maulvi',
    mapUrl: 'https://maps.google.com/?q=Famous+Complex,+NH48,+Prantij+383205',
    photo: require('../../assets/team/hashmi.png')
  },
  {
    name: 'Branch Office · Gandhinagar',
    address: 'Shreeji Signature, Opp. Aashka Hospital, Sargasan, Gandhinagar – 382421',
    phone: '+91 90165 18948',
    email: 'ca.rvyas22@gmail.com',
    hours: 'Mon–Sat · 10:00–18:30 IST',
    contactPerson: 'CA Rachana Vyas',
    mapUrl: 'https://maps.google.com/?q=Shreeji+Signature,+Sargasan,+Gandhinagar+382421',
    photo: require('../../assets/team/rachana.png')
  },
];
