import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Persona, PersonaId, NavLink } from './models';

const PERSONAS: Persona[] = [
  {
    id: 'pm',
    label: 'Portfolio Manager',
    subtitle: 'Thesis management & risk oversight',
    icon: '\u{1F4CA}',
    greeting: 'Here\'s your portfolio overview and key actions for today.',
    navLinks: [
      { route: '/',         label: 'Intelligence Hub'  },
      { route: '/pm',       label: 'PM Workstation'    },
      { route: '/research', label: 'Research Docket'   },
      { route: '/risk',       label: 'Risk Monitor'     },
      { route: '/chat',       label: 'Chat'             }
    ]
  },
  {
    id: 'sales',
    label: 'Sales / Distribution',
    subtitle: 'Client prep & relationship intel',
    icon: '\u{1F91D}',
    greeting: 'Your meetings and client preparation are ready.',
    navLinks: [
      { route: '/',         label: 'Intelligence Hub'  },
      { route: '/clients',  label: 'Client Intel'      },
      { route: '/chat',     label: 'Chat'              }
    ]
  },
  // {
  //   id: 'trading',
  //   label: 'Trading Desk',
  //   subtitle: 'Execution & market microstructure',
  //   icon: '\u{26A1}',
  //   greeting: 'Markets are open. Here\'s your execution landscape.',
  //   navLinks: [
  //     { route: '/',         label: 'Intelligence Hub'  },
  //     { route: '/pm',       label: 'PM Workstation'    },
  //     { route: '/risk',     label: 'Risk Monitor'      },
  //     { route: '/chat',     label: 'Chat'              }
  //   ]
  // },
  {
    id: 'research',
    label: 'Research Analyst',
    subtitle: 'Signal analysis & thesis validation',
    icon: '\u{1F52C}',
    greeting: 'Your research queue and pending signals await.',
    navLinks: [
      { route: '/',         label: 'Intelligence Hub'  },
      { route: '/research', label: 'Research Docket'   },
      { route: '/pm',         label: 'PM Workstation'   },
      { route: '/risk',       label: 'Risk Monitor'     },
      { route: '/chat',       label: 'Chat'             }
    ]
  },
  {
    id: 'executive',
    label: 'Executive',
    subtitle: 'Strategic overview & team performance',
    icon: '\u{1F3AF}',
    greeting: 'Strategic summary and team performance at a glance.',
    navLinks: [
      { route: '/',         label: 'Intelligence Hub'  },
      { route: '/risk',     label: 'Risk Monitor'      },
      { route: '/clients',  label: 'Client Intel'      },
      { route: '/chat',     label: 'Chat'              }
    ]
  }
];

@Injectable({ providedIn: 'root' })
export class PersonaService {
  private _persona = new BehaviorSubject<Persona>(PERSONAS[0]);

  persona$ = this._persona.asObservable();

  get current(): Persona { return this._persona.value; }

  get all(): Persona[] { return PERSONAS; }

  setPersona(id: PersonaId): void {
    const p = PERSONAS.find(p => p.id === id);
    if (p) this._persona.next(p);
  }
}
