# encoding: utf-8
class EventDocumentsController < ApplicationController

  before_action :set_document, only: [:destroy]

  def create
    @event = Event.find params[:event_id]

    @document = EventDocument.new document_params
    @document.event = @event

    if @document.save
      redirect_to @event, :notice => 'Документ успешно создан'
    else
      redirect_to @event, :alert => 'Возникла ошибка при записи документа'
    end
  end

  def destroy
    if @document.destroy
      redirect_to event_path(params[:event_id])
    else
      redirect_to @document
    end
  end

  private

  def document_params
    params[:event_document].permit(:name, :description, :attached_file)
  end

  def set_document
    @document = EventDocument.find(params[:id])
  end
end
