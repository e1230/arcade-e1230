-- Arcade E1230 — catálogo de juegos de producción
--
-- Las 8 filas de public.games de desarrollo al 2026-10-20, con los textos ya
-- actualizados por las migraciones update_*_description.
-- Se puede volver a ejecutar: si un juego ya existe, actualiza sus datos.
-- Corre después de 01-schema.sql.

insert into public.games (id, title, category, accent, short_description, long_description, sort_order) values
('arkanoid', 'ARKANOID', 'Clásicos', 'cyan',
 'Rompe todos los ladrillos con tu nave y la bola.',
 'Controla la nave Vaus y devuelve la bola de energía para destruir cada muro de ladrillos. Cada fase tiene un patrón distinto y la bola va más rápido que en la anterior. Tienes tres vidas: si la bola cae, pierdes una. Limpia las cinco fases para completar el juego.',
 1),
('tetris', 'TETRIS', 'Puzles', 'yellow',
 'Encaja las piezas y limpia líneas sin parar.',
 'Gira y coloca las piezas que caen para completar líneas horizontales. Cuidado con la tuerca: una pieza hueca que deja un agujero difícil de limpiar. Cada diez líneas subes de nivel y la caída se acelera. La partida termina cuando las piezas alcanzan el techo.',
 2),
('snake', 'SNAKE', 'Clásicos', 'pink',
 'Come, crece y no te muerdas la cola.',
 'Guía a la serpiente por la pantalla y come las frutas para crecer. Cada cinco frutas subes de nivel y la serpiente va más rápido. Tienes tres vidas: chocar con las paredes o contigo mismo te cuesta una y la serpiente vuelve a empezar desde el centro.',
 3),
('pacman', 'PAC-MAN', 'Laberinto', 'yellow',
 'Recorre el laberinto y esquiva a los fantasmas.',
 'Come todos los puntos del laberinto mientras cuatro fantasmas te persiguen. Las píldoras de poder te permiten darles la vuelta y comértelos durante unos segundos. Las frutas dan puntos extra.',
 4),
('invaders', 'SPACE INVADERS', 'Disparos', 'cyan',
 'Detén la invasión alienígena fila a fila.',
 'Oleadas de alienígenas descienden hacia la Tierra. Muévete tras los escudos y dispara antes de que lleguen al suelo. Cuantos menos quedan, más rápido avanzan.',
 5),
('asteroids', 'ASTEROIDS', 'Disparos', 'pink',
 'Pulveriza rocas espaciales en gravedad cero.',
 'Pilota una nave en un campo de asteroides y dispárales para partirlos en fragmentos cada vez más pequeños. Usa el hiperespacio para escapar en el último segundo y vigila los platillos enemigos.',
 6),
('frogger', 'FROGGER', 'Clásicos', 'yellow',
 'Cruza la carretera y el río sin convertirte en papilla.',
 'Guía a tu rana a través de una carretera repleta de coches y un río de troncos y tortugas que se sumergen. Llena las cinco bocas del otro lado para completar la ronda; cada nivel acelera el tráfico y acorta el tiempo. Tienes tres vidas y quince segundos por viaje.',
 7),
('galaga', 'GALAGA', 'Disparos', 'cyan',
 'Combate escuadrones que atacan en picado.',
 'Formaciones de insectos espaciales se lanzan en picado contra tu caza. Deja que un jefe capture tu nave y rescátala para disparar con doble potencia. Las fases de desafío premian la precisión.',
 8)
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  accent = excluded.accent,
  short_description = excluded.short_description,
  long_description = excluded.long_description,
  sort_order = excluded.sort_order;
