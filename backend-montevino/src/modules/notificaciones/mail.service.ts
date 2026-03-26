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
    tls: {
      rejectUnauthorized: false,
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
    const isPaid = resData.status === 'CONFIRMADA';

    const headerColor = isPaid ? '#28a745' : '#7c090c';
    const titleText = isPaid ? '¡Pago Confirmado!' : 'Confirmación de Reserva';
    const subTitleText = isPaid
      ? 'Hemos recibido tu pago correctamente. ¡Tu mesa ya está reservada!'
      : 'Tu reserva ha sido recibida con éxito. Aquí están los detalles:';

    const pedidosHtml = resData.pedidos
      .map(
        (p) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${p.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${p.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${p.price}</td>
      </tr>
    `,
      )
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; border-radius: 10px; overflow: hidden; margin: auto;">
        <div style="background-color: ${headerColor}; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">${titleText} - MonteVino</h2>
        </div>

        <div style="padding: 20px;">
          <p>Hola <strong>${resData.userName}</strong>,</p>
          <p>${subTitleText}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
            <tr><td style="padding: 5px;"><strong>Fecha:</strong></td><td>${resData.date}</td></tr>
            <tr><td style="padding: 5px;"><strong>Horario:</strong></td><td>${resData.time} hs</td></tr>
            <tr><td style="padding: 5px;"><strong>Personas:</strong></td><td>${resData.people}</td></tr>
            <tr><td style="padding: 5px;"><strong>Mesa:</strong></td><td>${resData.tableNumber || 'Pendiente de asignación'}</td></tr>
            <tr><td style="padding: 5px;"><strong>Estado:</strong></td><td style="color: ${headerColor}; font-weight: bold;">${resData.status}</td></tr>
          </table>

          <h3>Detalle del Pedido:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Plato</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Cant.</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${pedidosHtml}</tbody>
          </table>

          <h3 style="text-align: right; margin-top: 20px;">Total: $${resData.total}</h3>
          
          ${
            !isPaid
              ? `<p style="color: #757575; font-size: 13px; background: #fff3f3; padding: 10px; border-left: 4px solid #7c090c;">
            * Se requiere un depósito de <strong>$${resData.deposit}</strong> para confirmar tu lugar.
          </p>`
              : ''
          }
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="text-align: center; font-weight: bold; color: #555;">¡Te esperamos en MonteVino!</p>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: '"MonteVino Reservas" <no-reply@montevino.com>',
      to,
      subject: isPaid
        ? `Pago Confirmado #${resData.id.split('-')[0]}`
        : `Reserva Recibida #${resData.id.split('-')[0]}`,
      html,
    });
  }
}
