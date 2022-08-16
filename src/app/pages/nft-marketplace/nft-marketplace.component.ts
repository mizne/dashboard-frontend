import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-nft-marketplace',
  templateUrl: './nft-marketplace.component.html',
  styleUrls: ['./nft-marketplace.component.less'],
})
export class NFTMarketplaceComponent implements OnInit {
  constructor() {}

  projects = [
    {
      projectName: 'stepn',
      chains: ['sol', 'bnb', 'eth'],
      chainCtrl: new FormControl('sol'),
      viewFilters: [
        {
          category: 'sneaker',
          filters: [
            {
              label: 'class',
              type: 'select',
              options: ['all', 'walker', 'jogger', 'runner', 'trainer'],
            },
            {
              label: 'quality',
              type: 'select',
              options: [
                'all',
                'common',
                'uncommon',
                'rare',
                'epic',
                'legendary',
              ],
            },
          ],
        },
        {
          category: 'shoebox',
          filters: [
            {
              label: 'quality',
              type: 'select',
              options: [
                'all',
                'common',
                'uncommon',
                'rare',
                'epic',
                'legendary',
              ],
            },
          ],
        },
        {
          category: 'gem',
          filters: [
            {
              label: 'type',
              type: 'select',
              options: ['all', 'efficiency', 'luck', 'comfort', 'resilience'],
            },
          ],
        },
        {
          category: 'scroll',
          filters: [
            {
              label: 'quality',
              type: 'select',
              options: [
                'all',
                'common',
                'uncommon',
                'rare',
                'epic',
                'legendary',
              ],
            },
          ],
        },
      ],
    },
  ];

  ngOnInit() {}
}
