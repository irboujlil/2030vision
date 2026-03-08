import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AiService } from '../../core/ai.service';
import { PersonaService } from '../../core/persona.service';
import { Persona, PersonaId } from '../../core/models';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html'
})
export class NavComponent implements OnInit, OnDestroy {
  persona!: Persona;
  allPersonas: Persona[] = [];
  dropdownOpen = false;

  time = '';
  private timer?: ReturnType<typeof setInterval>;

  constructor(public ai: AiService, public personaService: PersonaService, private router: Router) {}

  ngOnInit() {
    this.allPersonas = this.personaService.all;
    this.personaService.persona$.subscribe(p => this.persona = p);
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  switchPersona(id: PersonaId) {
    this.personaService.setPersona(id);
    const active = this.personaService.current;
    const path = this.router.url.split('?')[0];
    const allowed = active.navLinks.some(l => l.route === path);
    if (!allowed) this.router.navigateByUrl('/');
    this.dropdownOpen = false;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  private tick() {
    this.time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
  }
}
