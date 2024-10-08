-- MySQL Script generated by MySQL Workbench
-- Mon Jul 15 14:13:30 2024
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema comedor_universitario
-- -----------------------------------------------------
Drop database if exists comedor_universitario;
CREATE database IF NOT EXISTS `comedor_universitario` DEFAULT CHARACTER SET utf8 ;
USE `comedor_universitario` ;

-- -----------------------------------------------------
-- Table `comedor_universitario`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comedor_universitario`.`users` (
  `idusers` INT NOT NULL AUTO_INCREMENT,
  `usuario` VARCHAR(45) NOT NULL,
  `contrasenia` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`idusers`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `comedor_universitario`.`Administracion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comedor_universitario`.`Administracion` (
  `idAdministracion` INT NOT NULL,
  `dep_responsable` VARCHAR(70) NOT NULL,
  `cargo_dep` VARCHAR(45) NOT NULL,
  `nombre` VARCHAR(45) NOT NULL,
  `ape_paterno` VARCHAR(45) NOT NULL,
  `ape_materno` VARCHAR(45) NOT NULL,
  `telefono` CHAR(12) NOT NULL,
  `correo` VARCHAR(45) NOT NULL,
  `idusers` INT NOT NULL,
  PRIMARY KEY (`idAdministracion`),
  INDEX `idusers1_idx` (`idusers` ASC) VISIBLE,
  CONSTRAINT `idusers1`
    FOREIGN KEY (`idusers`)
    REFERENCES `comedor_universitario`.`users` (`idusers`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `comedor_universitario`.`Carrera`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comedor_universitario`.`Carrera` (
  `idCarrera` INT NOT NULL AUTO_INCREMENT,
  `nom_carrera` VARCHAR(45) NOT NULL,

  PRIMARY KEY (`idCarrera`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `comedor_universitario`.`Estudiante`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comedor_universitario`.`Estudiante` (
  `codigoestudiante` INT NOT NULL,
  `dni` INT NOT NULL,
  `nombre` VARCHAR(45) NOT NULL,
  `ape_paterno` VARCHAR(45) NOT NULL,
  `ape_materno` VARCHAR(45) NOT NULL,
  `est_beca` ENUM("Activo", "Inactivo") NOT NULL,
  `tip_beca` ENUM("Becado", "Accesitario") NOT NULL,
  `idAdministracion` INT NOT NULL,
  `idCarrera` INT NOT NULL,
  `idusers` INT NOT NULL,
  PRIMARY KEY (`codigoestudiante`),
  INDEX `idAdministracion_idx` (`idAdministracion` ASC) VISIBLE,
  INDEX `idCarrera_idx` (`idCarrera` ASC) VISIBLE,
  INDEX `idusers4_idx` (`idusers` ASC) VISIBLE,
  CONSTRAINT `idAdministracion`
    FOREIGN KEY (`idAdministracion`)
    REFERENCES `comedor_universitario`.`Administracion` (`idAdministracion`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `idCarrera`
    FOREIGN KEY (`idCarrera`)
    REFERENCES `comedor_universitario`.`Carrera` (`idCarrera`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `idusers4`
    FOREIGN KEY (`idusers`)
    REFERENCES `comedor_universitario`.`users` (`idusers`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `comedor_universitario`.`Encuesta`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comedor_universitario`.`Encuesta` (
  `idEncuesta` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NOT NULL,
  `Comentario` VARCHAR(120) NOT NULL,
  `Puntuacion` INT NOT NULL,
  `codigoestudiante2` INT NOT NULL,
  PRIMARY KEY (`idEncuesta`),
  INDEX `codigoestudiante_idx` (`codigoestudiante2` ASC) VISIBLE,
  CONSTRAINT `codigoestudiante2`
    FOREIGN KEY (`codigoestudiante2`)
    REFERENCES `comedor_universitario`.`Estudiante` (`codigoestudiante`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `comedor_universitario`.`Asistencia`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comedor_universitario`.`Asistencia` (
  `idAsistencia` INT NOT NULL AUTO_INCREMENT,
  `fecha_hora` DATETIME NOT NULL,
  `codigoestudiante1` INT NOT NULL,
  PRIMARY KEY (`idAsistencia`),
  INDEX `codigoestudiante_idx` (`codigoestudiante1` ASC) VISIBLE,
  CONSTRAINT `codigoestudiante1`
    FOREIGN KEY (`codigoestudiante1`)
    REFERENCES `comedor_universitario`.`Estudiante` (`codigoestudiante`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `comedor_universitario`.`Concesionaria`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comedor_universitario`.`Concesionaria` (
  `idConcecionaria` INT NOT NULL,
  `nombre` VARCHAR(45) NOT NULL,
  `correo` VARCHAR(45) NOT NULL,
  `num_telefono` CHAR(12) NOT NULL,
  `nro` INT NOT NULL,
  `calle` VARCHAR(45) NOT NULL,
  `ciudad` VARCHAR(45) NOT NULL,
  `idusers` INT NOT NULL,
  PRIMARY KEY (`idConcecionaria`),
  INDEX `idusers2_idx` (`idusers` ASC) VISIBLE,
  CONSTRAINT `idusers2`
    FOREIGN KEY (`idusers`)
    REFERENCES `comedor_universitario`.`users` (`idusers`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `comedor_universitario`.`Menu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comedor_universitario`.`Menu` (
  `idMenu` INT NOT NULL,
  `fecha` VARCHAR(45) NOT NULL,
  `tip_menu` ENUM("Desayuno", "Almuerzo") NOT NULL,
  `idConcecionaria` INT NOT NULL,
  PRIMARY KEY (`idMenu`),
  INDEX `idConcecionaria_idx` (`idConcecionaria` ASC) VISIBLE,
  CONSTRAINT `idConcecionaria`
    FOREIGN KEY (`idConcecionaria`)
    REFERENCES `comedor_universitario`.`Concesionaria` (`idConcecionaria`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `comedor_universitario`.`Comida`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comedor_universitario`.`Comida` (
  `idComida` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `info_nutricional` VARCHAR(120) NOT NULL,
  `ingredientes` VARCHAR(45) NOT NULL,
  `idMenu` INT NOT NULL,
  PRIMARY KEY (`idComida`),
  INDEX `idMenu_idx` (`idMenu` ASC) VISIBLE,
  CONSTRAINT `idMenu`
    FOREIGN KEY (`idMenu`)
    REFERENCES `comedor_universitario`.`Menu` (`idMenu`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `comedor_universitario`.`Personal`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comedor_universitario`.`Personal` (
  `dni` INT NOT NULL,
  `nombre` VARCHAR(45) NOT NULL,
  `ape_paterno` VARCHAR(45) NOT NULL,
  `ape_materno` VARCHAR(45) NOT NULL,
  `cargo` VARCHAR(45) NOT NULL,
  `idConcesionaria2` INT NOT NULL,
  PRIMARY KEY (`dni`),
  INDEX `idConcecionaria_idx` (`idConcesionaria2` ASC) VISIBLE,
  CONSTRAINT `idConcesionaria2`
    FOREIGN KEY (`idConcesionaria2`)
    REFERENCES `comedor_universitario`.`Concesionaria` (`idConcecionaria`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `comedor_universitario`.`Categoria`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comedor_universitario`.`Categoria` (
  `idCategoria` INT NOT NULL,
  `nombre` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idCategoria`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `comedor_universitario`.`Contrato`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comedor_universitario`.`Contrato` (
  `idContrato` INT NOT NULL AUTO_INCREMENT,
  `fecha_fin` VARCHAR(45) NOT NULL,
  `fecha_inicio` VARCHAR(45) NOT NULL,
  `detalles` VARCHAR(45) NOT NULL,
  `est_contrato` ENUM("Activo", "Inactivo") NOT NULL,
  `idConcesionaria1` INT NOT NULL,
  `idAdministracion1` INT NOT NULL,
  PRIMARY KEY (`idContrato`),
  INDEX `idConcecionaria_idx` (`idConcesionaria1` ASC) VISIBLE,
  INDEX `idAdministracion_idx` (`idAdministracion1` ASC) VISIBLE,
  CONSTRAINT `idConcesionaria1`
    FOREIGN KEY (`idConcesionaria1`)
    REFERENCES `comedor_universitario`.`Concesionaria` (`idConcecionaria`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `idAdministracion1`
    FOREIGN KEY (`idAdministracion1`)
    REFERENCES `comedor_universitario`.`Administracion` (`idAdministracion`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `comedor_universitario`.`Inventario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comedor_universitario`.`Inventario` (
  `idInventario` INT NOT NULL,
  `nombre` VARCHAR(45) NOT NULL,
  `cant_disponible` INT NOT NULL,
  `fecha_caducidad` DATE NOT NULL,
  `idConcesionaria3` INT NOT NULL,
  `idCategoria` INT NOT NULL,
  PRIMARY KEY (`idInventario`),
  INDEX `idConcecionaria_idx` (`idConcesionaria3` ASC) VISIBLE,
  INDEX `idCategoria_idx` (`idCategoria` ASC) VISIBLE,
  CONSTRAINT `idConcesionaria3`
    FOREIGN KEY (`idConcesionaria3`)
    REFERENCES `comedor_universitario`.`Concesionaria` (`idConcecionaria`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `idCategoria`
    FOREIGN KEY (`idCategoria`)
    REFERENCES `comedor_universitario`.`Categoria` (`idCategoria`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `comedor_universitario`.`Proveedor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comedor_universitario`.`Proveedor` (
  `idProveedor` INT NOT NULL,
  `nombre` VARCHAR(45) NOT NULL,
  `telefono` VARCHAR(45) NOT NULL,
  `nro` VARCHAR(45) NOT NULL,
  `calle` VARCHAR(45) NOT NULL,
  `ciudad` VARCHAR(45) NOT NULL,
  `referencia` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idProveedor`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `comedor_universitario`.`regis_compra`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comedor_universitario`.`regis_compra` (
  `idregis_compra` INT NOT NULL,
  `cant_comprada` INT NOT NULL,
  `fecha` DATE NOT NULL,
  `cost_total` FLOAT NOT NULL,
  `idInventario` INT NOT NULL,
  `idProveedor` INT NOT NULL,
  PRIMARY KEY (`idregis_compra`),
  INDEX `idInventario_idx` (`idInventario` ASC) VISIBLE,
  INDEX `idProveedor_idx` (`idProveedor` ASC) VISIBLE,
  CONSTRAINT `idInventario`
    FOREIGN KEY (`idInventario`)
    REFERENCES `comedor_universitario`.`Inventario` (`idInventario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `idProveedor`
    FOREIGN KEY (`idProveedor`)
    REFERENCES `comedor_universitario`.`Proveedor` (`idProveedor`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
-- Insertar datos en la tabla users

-- Insertar datos en la tabla Administracion
INSERT INTO `Administracion` (`idAdministracion`, `dep_responsable`, `cargo_dep`, `nombre`, `ape_paterno`, `ape_materno`, `telefono`, `correo`, `idusers`) VALUES
(1, 'Departamento 1', 'Cargo 1', 'Nombre1', 'Apellido1', 'Apellido2', '123456789012', 'correo1@example.com', 1),
(2, 'Departamento 2', 'Cargo 2', 'Nombre2', 'Apellido1', 'Apellido2', '123456789012', 'correo2@example.com', 2),
(3, 'Departamento 3', 'Cargo 3', 'Nombre3', 'Apellido1', 'Apellido2', '123456789012', 'correo3@example.com', 3),
(4, 'Departamento 4', 'Cargo 4', 'Nombre4', 'Apellido1', 'Apellido2', '123456789012', 'correo4@example.com', 4),
(5, 'Departamento 5', 'Cargo 5', 'Nombre5', 'Apellido1', 'Apellido2', '123456789012', 'correo5@example.com', 5);

-- Insertar datos en la tabla Carrera
INSERT INTO `Carrera` (`idCarrera`, `nom_carrera`) VALUES
(1, 'Carrera 1'),
(2, 'Carrera 2'),
(3, 'Carrera 3'),
(4, 'Carrera 4'),
(5, 'Carrera 5');

-- Insertar datos en la tabla Estudiante
INSERT INTO `Estudiante` (`codigoestudiante`, `dni`, `nombre`, `ape_paterno`, `ape_materno`, `est_beca`, `tip_beca`, `idAdministracion`, `idCarrera`, `idusers`) VALUES
(1, 12345678, 'Estudiante1', 'Apellido1', 'Apellido2', 'Activo', 'Becado', 1, 1, 1),
(2, 23456789, 'Estudiante2', 'Apellido1', 'Apellido2', 'Activo', 'Accesitario', 2, 2, 2),
(3, 34567890, 'Estudiante3', 'Apellido1', 'Apellido2', 'Inactivo', 'Becado', 3, 3, 3),
(4, 45678901, 'Estudiante4', 'Apellido1', 'Apellido2', 'Activo', 'Becado', 4, 4, 4),
(5, 56789012, 'Estudiante5', 'Apellido1', 'Apellido2', 'Inactivo', 'Accesitario', 5, 5, 5);

-- Insertar datos en la tabla Encuesta
INSERT INTO `Encuesta` (`idEncuesta`, `fecha`, `Comentario`, `Puntuacion`, `codigoestudiante2`) VALUES
(1, '2024-01-01', 'Comentario 1', 5, 1),
(2, '2024-02-01', 'Comentario 2', 4, 2),
(3, '2024-03-01', 'Comentario 3', 3, 3),
(4, '2024-04-01', 'Comentario 4', 2, 4),
(5, '2024-05-01', 'Comentario 5', 1, 5);

-- Insertar datos en la tabla Asistencia
INSERT INTO `Asistencia` (`idAsistencia`, `fecha_hora`, `codigoestudiante1`) VALUES
(1, '2024-01-01 08:00:00', 1),
(2, '2024-02-01 08:00:00', 2),
(3, '2024-03-01 08:00:00', 3),
(4, '2024-04-01 08:00:00', 4),
(5, '2024-05-01 08:00:00', 5);

-- Insertar datos en la tabla Concesionaria
INSERT INTO `Concesionaria` (`idConcecionaria`, `nombre`, `correo`, `num_telefono`, `nro`, `calle`, `ciudad`, `idusers`) VALUES
(1, 'Concesionaria 1', 'concesionaria1@example.com', '123456789012', 1, 'Calle 1', 'Ciudad 1', 1),
(2, 'Concesionaria 2', 'concesionaria2@example.com', '123456789012', 2, 'Calle 2', 'Ciudad 2', 2),
(3, 'Concesionaria 3', 'concesionaria3@example.com', '123456789012', 3, 'Calle 3', 'Ciudad 3', 3),
(4, 'Concesionaria 4', 'concesionaria4@example.com', '123456789012', 4, 'Calle 4', 'Ciudad 4', 4),
(5, 'Concesionaria 5', 'concesionaria5@example.com', '123456789012', 5, 'Calle 5', 'Ciudad 5', 5);

-- Insertar datos en la tabla Menu
INSERT INTO `Menu` (`idMenu`, `fecha`, `tip_menu`, `idConcecionaria`) VALUES
(1, '2024-01-01', 'Desayuno', 1),
(2, '2024-02-01', 'Almuerzo', 2),
(3, '2024-03-01', 'Desayuno', 3),
(4, '2024-04-01', 'Almuerzo', 4),
(5, '2024-05-01', 'Desayuno', 5);

-- Insertar datos en la tabla Comida
INSERT INTO `Comida` (`idComida`, `nombre`, `info_nutricional`, `ingredientes`, `idMenu`) VALUES
(1, 'Comida 1', 'Info 1', 'Ingrediente 1', 1),
(2, 'Comida 2', 'Info 2', 'Ingrediente 2', 2),
(3, 'Comida 3', 'Info 3', 'Ingrediente 3', 3),
(4, 'Comida 4', 'Info 4', 'Ingrediente 4', 4),
(5, 'Comida 5', 'Info 5', 'Ingrediente 5', 5);

-- Insertar datos en la tabla Personal
INSERT INTO `Personal` (`dni`, `nombre`, `ape_paterno`, `ape_materno`, `cargo`, `idConcesionaria2`) VALUES
(12345678, 'Personal1', 'Apellido1', 'Apellido2', 'Cargo 1', 1),
(23456789, 'Personal2', 'Apellido1', 'Apellido2', 'Cargo 2', 2),
(34567890, 'Personal3', 'Apellido1', 'Apellido2', 'Cargo 3', 3),
(45678901, 'Personal4', 'Apellido1', 'Apellido2', 'Cargo 4', 4),
(56789012, 'Personal5', 'Apellido1', 'Apellido2', 'Cargo 5', 5);

-- Insertar datos en la tabla Categoria
INSERT INTO `Categoria` (`idCategoria`, `nombre`) VALUES
(1, 'Categoria 1'),
(2, 'Categoria 2'),
(3, 'Categoria 3'),
(4, 'Categoria 4'),
(5, 'Categoria 5');

-- Insertar datos en la tabla Contrato
INSERT INTO `Contrato` (`idContrato`, `fecha_fin`, `fecha_inicio`, `detalles`, `est_contrato`, `idConcesionaria1`, `idAdministracion1`) VALUES
(1, '2024-12-31', '2024-01-01', 'Detalles 1', 'Activo', 1, 1),
(2, '2025-12-31', '2025-01-01', 'Detalles 2', 'Activo', 2, 2),
(3, '2026-12-31', '2026-01-01', 'Detalles 3', 'Activo', 3, 3),
(4, '2027-12-31', '2027-01-01', 'Detalles 4', 'Activo', 4, 4),
(5, '2028-12-31', '2028-01-01', 'Detalles 5', 'Activo', 5, 5);
INSERT INTO `comedor_universitario`.`Inventario` (`idInventario`, `nombre`, `cant_disponible`, `fecha_caducidad`, `idConcesionaria3`, `idCategoria`) VALUES
(1, 'Producto 1', 100, '2024-12-31', 1, 1),
(2, 'Producto 2', 200, '2024-11-30', 2, 2),
(3, 'Producto 3', 150, '2024-10-31', 3, 3),
(4, 'Producto 4', 250, '2024-09-30', 4, 4),
(5, 'Producto 5', 300, '2024-08-31', 5, 5);

Show tables; 
SELECT*FROM estudiante;
SELECT*FROM users;
SELECT*FROM carrera;
select*from asistencia;
select*from inventario;
select*from categoria;
select*from concesionaria;