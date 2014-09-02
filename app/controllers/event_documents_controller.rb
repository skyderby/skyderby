# encoding: utf-8
class EventDocumentsController < ApplicationController

  def create
    doc_params = params[:event_document].permit(:name, :description, :attached_file)
    event = Event.find(params[:event_id])
    doc = EventDocument.new :name => doc_params[:name], :description => doc_params[:description],
                            :attached_file => doc_params[:attached_file], :event => event
    if doc.save
      redirect_to event, :notice => 'Документ успешно создан'
    else
      redirect_to event, :alert => 'Возникла ошибка при записи документа'
    end
  end

  def destroy
    doc = EventDocument.find(params[:id])
    event = Event.find(params[:event_id])
    doc.destroy
    respond_to do |format|
      format.html{ redirect_to event}
    end
  end

end
