# encoding: utf-8
class ParticipationFormsController < ApplicationController

  def create

    form_params = params[:participation_form].permit(:wingsuit_id, :additional_info)
    event = Event.find(params[:event_id])
    user = current_user

    @participation_form = ParticipationForm.new :user => user, :event => event,
                       :wingsuit => Wingsuit.find(form_params[:wingsuit_id]),
                       :additional_info => form_params[:additional_info]

    if @participation_form.save
      redirect_to event, notice: 'Заявка успешно отправлена.'
    else
      redirect_to event, flash: 'Возникла ошибка при записи заявки'
    end

  end

  def approve

  end

  def decline

  end

end
