import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendWelcomeEmail(to: string, name: string) {
    const html = `
      <h1>¡Bienvenido a MonteVino, ${name}!</h1>
      <p>Estamos felices de que te hayas unido a nuestra comunidad. 
      Ya podés empezar a reservar tus mesas y disfrutar de los mejores platos.</p>
      <br>
      <p>Muchas gracias por registrarte.</p>
    `;

    await this.transporter.sendMail({
      from: '"MonteVino Restaurant" <no-reply@montevino.com>',
      to,
      subject: '¡Bienvenido a MonteVino!',
      html,
    });
  }

  async sendReservationEmail(to: string, resData: any) {
    const pedidosHtml = resData.pedidos.map(p => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${p.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${p.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${p.price}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #7c090c;">Confirmación de Reserva - MonteVino</h2>
        <p>Hola <strong>${resData.userName}</strong>,</p>
        <p>Tu reserva ha sido recibida con éxito. Aquí están los detalles:</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td><strong>Fecha:</strong></td><td>${resData.date}</td></tr>
          <tr><td><strong>Horario:</strong></td><td>${resData.time} hs</td></tr>
          <tr><td><strong>Personas:</strong></td><td>${resData.people}</td></tr>
          <tr><td><strong>Estado:</strong></td><td>${resData.status}</td></tr>
        </table>

        <h3>Detalle del Pedido:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd;">Plato</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Cant.</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${pedidosHtml}</tbody>
        </table>

        <h3 style="text-align: right;">Total a Pagar: $${resData.total}</h3>
        <p style="color: #757575; font-size: 12px;">* Se requiere un depósito de $${resData.deposit} para confirmar.</p>
        
        <hr>
        <p style="text-align: center; font-weight: bold;">Muchas gracias por reservar en MonteVino</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: '"MonteVino Reservas" <no-reply@montevino.com>',
      to,
      subject: `Reserva Confirmada #${resData.id.split('-')[0]}`,
      html,
    });
  }
}