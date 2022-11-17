import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { FormationsComponent } from './formations/formations.component';
import { ExperiencesComponent } from './experiences/experiences.component';
import { SkillsComponent } from './skills/skills.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { RouteResolver } from './resolvers/route.resolver';
import { BubbleComponent } from './bubble/bubble.component';
import { PassionsComponent } from './passions/passions.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'experiences', component: ExperiencesComponent },
  { path: 'education', component: FormationsComponent },
  { path: 'skills', component: SkillsComponent },
  { path: 'passions', component: PassionsComponent },
  { path: 'bubble', component: BubbleComponent },
  { path: '**', component: NotFoundComponent },

  // { path: '', redirectTo: '/home', pathMatch: 'full' },

  // {
  //   path: 'skills',
  //   pathMatch: 'full',
  //   component: SkillsComponent,
  //   resolve: {
  //     skills: RouteResolver
  //   }
  // },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [RouteResolver],
})
export class AppRoutingModule {}
