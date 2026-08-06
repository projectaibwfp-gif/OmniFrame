import { __decorate } from "tslib";
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
let AppComponent = class AppComponent {
};
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        standalone: true,
        imports: [RouterLink, RouterLinkActive, RouterOutlet],
        templateUrl: './app.component.html',
        styleUrl: './app.component.scss',
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
], AppComponent);
export { AppComponent };
