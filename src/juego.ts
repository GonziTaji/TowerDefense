import { Punto } from "./punto";
import { Torre } from "./torre";
import { Monstruo } from "./monstruo";
import { TipoAtaque } from "./tipoAtaque";
import { gameConfig } from "./config";

export class Juego {
    private _mapa: number[][];
    private _camino: Punto[]; 
    private _monstruos: Monstruo[];
    private _torres: Torre[];
    private _oleada: number = 0;
    private _vida: number;
    private escena: String[][];

    constructor(mapa: number[][]) {
        this._torres = [];
        this._monstruos = [];
        this._camino = [];
        this._vida = gameConfig.vidaJugador;
        this._mapa = mapa;
        this.init();
    }

    private get _monstruosVivos() {
        for (let m of this._monstruos) {
            if (m.vida > 0) {
                return m;
            }
        }
    }

    private init() {
        this.leerCamino();

        this.crearTorre(new Punto(2, 1), 2, new TipoAtaque(1, 500));
        this.crearTorre(new Punto(1, 3), 2, new TipoAtaque(1, 500));
        this.crearTorre(new Punto(2, 5), 2, new TipoAtaque(1, 500));

        this.comenzarOleada();
    }

    private comenzarOleada() {
        this.crearOleada();
        this.comenzarMovimiento();
    }

    private crearOleada() {
        const datos = gameConfig.oleadas[this._oleada];

        this._monstruos = [];

        for (let i = 0; i < datos.cantidad; i++) {
            this.crearMonstruo(datos.velocidad, datos.vida, this._camino);            
        }
    }

    private comenzarMovimiento() {
        let indiceMonstruo = 0;

        let idInterval = setInterval(() => {
            if (indiceMonstruo < this._monstruos.length) {
                this._monstruos[indiceMonstruo].comenzarMovimiento();
                indiceMonstruo++;
            }

            this.notificarTorres();

            this._monstruos.forEach((m, i, a) => {
                if (m.vida > 0 && m.posicion.equals(new Punto(-1, -1))) {
                    // quitar vida al jugador y matar monstruo
                    a[i].recibirDanio(999);
                    this.perderVida(1);
                }
            });

            if (this._monstruosVivos.length == 0) {
                clearInterval(idInterval);
                
                if (this._oleada < gameConfig.oleadas.length) {
                    this._oleada++;
                    this.comenzarOleada();
                
                } else {
                    this.terminarJuego(true)
                }
            }

            this.mostrarEscena();
        }, gameConfig.intervalo);
    }

    private perderVida(danio: number) {
        this._vida -= danio;
        if (this._vida <=0) {
            this.terminarJuego(false);
        }
    }

    private terminarJuego(victoria: boolean) { console.log('JUEGO TERMINADO') };

    private notificarTorres() {
        this._torres.forEach(t => t.observar(this._monstruosVivos));
    }

    private crearEscena() {/*
        Generacion de una tabla con strings y por lo tanto printeable, la cual 
        corresponde a la escena o tablero completo actualizado.*/

        let map_rows = this._mapa.length;
        let map_cols = this._mapa[0].length;

        //Crea formato de la escena
        for (let i = 0; i < map_rows; i++) {
            this.escena.push([]);
        }

        //crea una linea base
        let void_row = [];
        for (let i = 0; i < map_cols; i++) {
            void_row.push('#');
        }

        //dibuja todas las lineas base
        for (let row of this._mapa) {
            row = void_row; 
        }

        //sobre dibuja camino
        for (let posElement of this._camino) {
            this.escena[posElement.x][posElement.y] = ' ';
        }

        //sobre dibuja monstruos
        for (let m of this._monstruos) {
            this.escena[m.posicion.x][m.posicion.y] = String(m.vida);
        }

        //sobre dibuja torres
        for (let t of this._torres) {
            this.escena[t.posicion.x][t.posicion.y] = 'T';
        }
    }

    private mostrarEscena() {
        //Por implementar, dibujar monstruos y torres
        document.body.innerHTML = '';
        
        for (let row of this.escena) {

            for (let col of row) {
                document.write(col);
                }
            }

            document.write("<br />");
        }     
    }

    private leerCamino() {

        let x = 0;
        let y = 0;

        for (let row of this._mapa) {
            for (let col of row) {
                
                if (col == (this._camino.length + 1)) {
                    this._camino.push(new Punto(x, y));
                    this.leerCamino();
                }
                x++;
            }
            y++;
            x = 0;
        }
    }

    private crearTorre(pos:Punto, rango:number, tipoAtaque:TipoAtaque) {
        let torre = new Torre(pos, rango, tipoAtaque);
        this._torres.push(torre);
    }

    private eliminarTorre(torre:Torre) {
        let index = this._torres.indexOf(torre);
        this._torres.splice(index, 1);
    }

    private crearMonstruo(velocidad:number, vida:number, camino:Punto[]) {
        let monstruo = new Monstruo(velocidad, vida, camino);
        this._monstruos.push(monstruo);
    }
}