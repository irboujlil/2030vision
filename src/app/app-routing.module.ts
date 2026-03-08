import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PmWorkstationComponent } from './features/pm-workstation/pm-workstation.component';
import { ResearchDocket2Component } from './features/research-docket2/research-docket2.component';
import { ClientIntelComponent } from './features/client-intel/client-intel.component';
import { RiskMonitorComponent } from './features/risk-monitor/risk-monitor.component';
import { ChatComponent } from './features/chat/chat.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'pm', component: PmWorkstationComponent },
  { path: 'research', component: ResearchDocket2Component },
  { path: 'research-2', redirectTo: 'research', pathMatch: 'full' },
  { path: 'clients', component: ClientIntelComponent },
  { path: 'risk', component: RiskMonitorComponent },
  { path: 'chat', component: ChatComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
