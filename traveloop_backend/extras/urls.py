from django.urls import path
from .views import (
    ExpenseListCreateView, ExpenseDetailView, BudgetView,
    ChecklistItemListView, ChecklistItemDetailView, ChecklistResetView,
    NoteListCreateView, NoteDetailView
)

urlpatterns = [
    path('trips/<int:trip_pk>/expenses/', ExpenseListCreateView.as_view(), name='expense-list'),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense-detail'),
    path('trips/<int:trip_pk>/budget/', BudgetView.as_view(), name='budget'),
    path('trips/<int:trip_pk>/checklist/', ChecklistItemListView.as_view(), name='checklist-list'),
    path('checklist/<int:pk>/', ChecklistItemDetailView.as_view(), name='checklist-detail'),
    path('trips/<int:trip_pk>/checklist/reset/', ChecklistResetView.as_view(), name='checklist-reset'),
    path('trips/<int:trip_pk>/notes/', NoteListCreateView.as_view(), name='note-list'),
    path('notes/<int:pk>/', NoteDetailView.as_view(), name='note-detail'),
]
