import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 1,
        //label: 'MENUITEMS.APPS.TEXT',
        label: 'Sayfalar',
        isTitle: true
    },
    {
        id: 2,
        label: 'Hakkımızda',
        icon: 'bx-calendar',
        link: '/hakkimizda',
    },
    {
        id: 3,
        label: 'Kategoriler',
        icon: 'bx-calendar',
        link: '/kategoriler',
    },
    {
        id: 4,
        label: 'Ürünler',
        icon: 'bx-calendar',
        link: '/urunler',
    },
    {
        id: 5,
        label: 'Dosyalar',
        icon: 'bx-calendar',
        link: '/dosyalar',
    }
];

