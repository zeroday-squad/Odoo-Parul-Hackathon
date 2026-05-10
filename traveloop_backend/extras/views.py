from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from .models import Expense, ChecklistItem, Note
from .serializers import ExpenseSerializer, ChecklistItemSerializer, NoteSerializer
from trips.models import Trip


#views functions 

class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(trip_id=self.kwargs['trip_pk'], trip__user=self.request.user)

    def perform_create(self, serializer):
        trip = get_object_or_404(Trip, pk=self.kwargs['trip_pk'], user=self.request.user)
        serializer.save(trip=trip)

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(trip__user=self.request.user)
    
class BudgetView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, trip_pk):
        trip = get_object_or_404(Trip, pk=trip_pk, user=request.user)
        total_budget = trip.stops.aggregate(Sum('budget'))['budget__sum'] or 0
        expenses = trip.expenses.all()
        total_spent = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
        
        by_category = {}
        for expense in expenses:
            by_category[expense.category] = float(by_category.get(expense.category, 0)) + float(expense.amount)
            
        by_day_dict = {}
        for expense in expenses:
            date_str = str(expense.date)
            by_day_dict[date_str] = float(by_day_dict.get(date_str, 0)) + float(expense.amount)
        
        by_day = [{'date': k, 'amount': v} for k, v in by_day_dict.items()]
        by_day = sorted(by_day, key=lambda x: x['date'])
        
        average_per_day = float(total_spent) / len(by_day) if by_day else 0
        over_budget_days = [d['date'] for d in by_day if d['amount'] > average_per_day]

        return Response({
            'total_budget': float(total_budget),
            'total_spent': float(total_spent),
            'remaining': float(total_budget) - float(total_spent),
            'by_category': by_category,
            'by_day': by_day,
            'average_per_day': average_per_day,
            'over_budget_days': over_budget_days
        })

class ChecklistItemListView(generics.ListCreateAPIView):
    serializer_class = ChecklistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChecklistItem.objects.filter(trip_id=self.kwargs['trip_pk'], trip__user=self.request.user)

    def perform_create(self, serializer):
        trip = get_object_or_404(Trip, pk=self.kwargs['trip_pk'], user=self.request.user)
        serializer.save(trip=trip)

class ChecklistItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ChecklistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChecklistItem.objects.filter(trip__user=self.request.user)

class ChecklistResetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, trip_pk):
        ChecklistItem.objects.filter(trip_id=trip_pk, trip__user=request.user).update(is_packed=False)
        return Response({'status': 'reset'})

class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Note.objects.filter(trip_id=self.kwargs['trip_pk'], trip__user=self.request.user)
        stop_id = self.request.query_params.get('stop_id')
        if stop_id:
            qs = qs.filter(stop_id=stop_id)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        trip = get_object_or_404(Trip, pk=self.kwargs['trip_pk'], user=self.request.user)
        serializer.save(trip=trip)

class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(trip__user=self.request.user)

