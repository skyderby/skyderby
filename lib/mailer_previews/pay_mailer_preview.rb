class MailerPreviews::PayMailerPreview < ActionMailer::Preview
  def receipt
    charge = Pay::Charge.last
    Pay::UserMailer.with(
      pay_customer: charge.customer,
      pay_charge: charge
    ).receipt
  end
end
