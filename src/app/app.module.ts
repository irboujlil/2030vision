import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Shared
import { NavComponent } from './shared/nav/nav.component';
import { AiStreamComponent } from './shared/ai-stream/ai-stream.component';
import { EmptyStateComponent } from './shared/empty-state/empty-state.component';

// Features
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PmWorkstationComponent } from './features/pm-workstation/pm-workstation.component';
import { ResearchDocketComponent } from './features/research-docket/research-docket.component';
import { ResearchDocket2Component } from './features/research-docket2/research-docket2.component';
import { ClientIntelComponent } from './features/client-intel/client-intel.component';
import { RiskMonitorComponent } from './features/risk-monitor/risk-monitor.component';
import { ChatComponent } from './features/chat/chat.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    AiStreamComponent,
    EmptyStateComponent,
    DashboardComponent,
    PmWorkstationComponent,
    ResearchDocketComponent,
    ResearchDocket2Component,
    ClientIntelComponent,
    RiskMonitorComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
