import { Component } from '@angular/core';

import { BookPage } from '../book/book';
import { ProfilePage } from '../profile/profile';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = BookPage;
  tab3Root = ProfilePage;

  constructor() {

  }
}
