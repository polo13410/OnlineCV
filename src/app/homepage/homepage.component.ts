import { Component, OnInit } from '@angular/core';
import { Header } from 'src/assets/contentInterface';
import { GetJsonService } from '../get-json.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  profile?: string | undefined;
  header: Header | undefined;

  constructor(private readonly json: GetJsonService) {}

  ngOnInit(): void {
    this.json.getProfile(0)?.subscribe((data) => {
      this.profile = data;
    });
    this.json.getHeader(0)?.subscribe((data) => {
      this.header = data;
    });
  }

  contactAction(type: string = 'phone') {
    if (type == 'phone') {
      location.href = 'tel:+33660050426';
      return;
    } else if (type == 'mail') {
      location.href =
        "mailto:paul.pera@viacesi.fr?subject=A propos de votre site..&body=Bonjour paul!\n\n";
      return;
    }
  }
}
