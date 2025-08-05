import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../services/wallet_service.dart';
import '../services/trading_service.dart';

class PositionList extends StatelessWidget {
  const PositionList({super.key});

  @override
  Widget build(BuildContext context) {
    final tradingService = context.watch<TradingService>();
    final positions = tradingService.positions;

    if (positions.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Text(
                'Open Positions',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              const Text('No open positions'),
            ],
          ),
        ),
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Open Positions',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: positions.length,
              itemBuilder: (context, index) {
                final position = positions[index];
                return PositionCard(position: position);
              },
            ),
          ],
        ),
      ),
    );
  }
}

class PositionCard extends StatelessWidget {
  final Position position;

  const PositionCard({
    super.key,
    required this.position,
  });

  @override
  Widget build(BuildContext context) {
    final walletService = context.read<WalletService>();
    final tradingService = context.read<TradingService>();
    final numberFormat = NumberFormat.decimalPattern();
    final dateFormat = DateFormat('MMM d, y HH:mm');

    return Card(
      margin: const EdgeInsets.only(bottom: 8.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      position.isLong
                          ? Icons.arrow_upward
                          : Icons.arrow_downward,
                      color: position.isLong ? Colors.green : Colors.red,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      position.isLong ? 'Long' : 'Short',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Text(
                  '${position.leverage}x',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Amount:'),
                Text(
                  '${numberFormat.format(position.amount)} ETH',
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Entry Price:'),
                Text(
                  '\$${numberFormat.format(position.entryPrice)}',
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Open Time:'),
                Text(
                  dateFormat.format(position.openTime),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: tradingService.isLoading
                    ? null
                    : () async {
                        try {
                          final txHash = await tradingService.closePosition(
                            walletService.web3client,
                            walletService.address,
                            position.id,
                          );

                          if (!context.mounted) return;

                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Position closing: $txHash'),
                              duration: const Duration(seconds: 5),
                            ),
                          );
                        } catch (e) {
                          if (!context.mounted) return;

                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Error: ${e.toString()}'),
                              backgroundColor: Colors.red,
                            ),
                          );
                        }
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                ),
                child: const Text('Close Position'),
              ),
            ),
          ],
        ),
      ),
    );
  }
} 