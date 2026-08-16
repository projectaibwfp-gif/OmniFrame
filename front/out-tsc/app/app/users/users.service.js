import { __decorate } from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { buildApiUrl } from '../config/api.config';
let UsersService = class UsersService {
    constructor() {
        this.http = inject(HttpClient);
    }
    getUsers() {
        return this.http
            .get(buildApiUrl('/users'))
            .pipe(map((response) => response.data));
    }
};
UsersService = __decorate([
    Injectable({ providedIn: 'root' })
], UsersService);
export { UsersService };
