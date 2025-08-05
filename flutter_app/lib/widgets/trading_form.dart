import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:decimal/decimal.dart';
import '../services/wallet_service.dart';
import '../services/trading_service.dart';

class TradingForm extends StatefulWidget {
  const TradingForm({super.key});

  @override
  State<TradingForm> createState() => _TradingFormState();
}

class _TradingFormState extends State<TradingForm> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _leverageController = TextEditingController();
  bool _isLong = true;

  @override
  void dispose() {
    _amountController.dispose();
    _leverageController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    final amount = Decimal.parse(_amountController.text);
    final leverage = int.parse(_leverageController.text);

    final walletService = context.read<WalletService>();
    final tradingService = context.read<TradingService>();

    try {
      final txHash = _isLong
          ? await tradingService.openLongPosition(
              walletService.web3client,
              walletService.address,
              amount,
              leverage,
            )
          : await tradingService.openShortPosition(
              walletService.web3client,
              walletService.address,
              amount,
              leverage,
            );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Transaction submitted: $txHash'),
          duration: const Duration(seconds: 5),
        ),
      );

      _amountController.clear();
      _leverageController.clear();
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final tradingService = context.watch<TradingService>();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Open Position',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              SegmentedButton<bool>(
                segments: const [
                  ButtonSegment<bool>(
                    value: true,
                    label: Text('Long'),
                    icon: Icon(Icons.arrow_upward),
                  ),
                  ButtonSegment<bool>(
                    value: false,
                    label: Text('Short'),
                    icon: Icon(Icons.arrow_downward),
                  ),
                ],
                selected: {_isLong},
                onSelectionChanged: (Set<bool> newSelection) {
                  setState(() {
                    _isLong = newSelection.first;
                  });
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _amountController,
                decoration: const InputDecoration(
                  labelText: 'Amount (ETH)',
                  border: OutlineInputBorder(),
                ),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter an amount';
                  }
                  if (Decimal.tryParse(value) == null) {
                    return 'Please enter a valid number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _leverageController,
                decoration: const InputDecoration(
                  labelText: 'Leverage (1-100x)',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter leverage';
                  }
                  final leverage = int.tryParse(value);
                  if (leverage == null || leverage < 1 || leverage > 100) {
                    return 'Leverage must be between 1 and 100';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: tradingService.isLoading ? null : _submitForm,
                child: tradingService.isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Submit'),
              ),
            ],
          ),
        ),
      ),
    );
  }
} 