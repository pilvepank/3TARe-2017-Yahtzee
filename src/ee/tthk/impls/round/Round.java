package ee.tthk.impls.round;

import ee.tthk.impls.die.Die;
import ee.tthk.interfaces.IDie;
import ee.tthk.interfaces.IPlayer;
import ee.tthk.interfaces.IRound;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

/**
 * Created by Rait on 03.10.2017.
 */
public class Round implements IRound {

    private int rolls;
    private List<IDie> diceInHand;
    private IPlayer currentPlayer;

    // One scanner for the whole game: a new Scanner per prompt buffers ahead and swallows the input that follows it
    private static final Scanner IN = new Scanner(System.in).useDelimiter("\\n");

    public void roll(List<IDie> dice)
    {
        if (dice == null) {
            return;
        }
        if (currentPlayer == null) {
            return;
        }
        for (int i = 0; i < dice.size(); i++)
        {
            dice.get(i).Roll();
        }
        rolls++;
    }

    public void keepDice(List<IDie> dice)
    {
        boolean inProgress = true;
        while (inProgress) {
            System.out.print("The dice are: ");
            for (int i = 0; i < dice.size(); i++) {
                System.out.print(dice.get(i).GetTulemus() + ", ");
            }
            System.out.print("\n");

            System.out.print("Your dice are: ");
            for (int i = 0; i < diceInHand.size(); i++) {
                if (diceInHand.get(i) != null) {
                    System.out.print(diceInHand.get(i).GetTulemus() + ", ");
                }
            }
            System.out.print("\n");

            System.out.println("Options:");
            System.out.println("1 - Choose dice to keep");
            System.out.println("2 - Choose dice to return");
            if (rolls != 3) {
                System.out.println("3 - Roll again");
            } else {
                System.out.println("3 - Do nothing");
            }

            System.out.print("Enter option: ");
            Scanner in = IN;
            int option;
            try {
                option = Integer.parseInt(in.next().trim());
            } catch (NumberFormatException e) {
                System.out.println("Please enter 1, 2 or 3.");
                continue;
            }
            switch (option) {
                case 1:
                case 2:
                    System.out.print("Choose dice to " + ((option == 1) ? "keep: " : "return: "));
                    String line = in.next();
                    String[] s = line.split(",");
                    diceLoop: for (int i = 0; i < s.length; i++) {
                        int value;
                        try {
                            value = Integer.parseInt(s[i].trim());
                        } catch (NumberFormatException e) {
                            continue; // ignore anything that is not a number
                        }
                        if (value >= 1 && value <= 6) {
                            if (option == 1) {
                                for (IDie die : dice) {
                                    if (value == die.GetTulemus()) {
                                        diceInHand.add(die);
                                        dice.remove(die);
                                        continue diceLoop;
                                    }
                                }
                            } else {
                                for (IDie die : diceInHand) {
                                    if (value == die.GetTulemus()) {
                                        dice.add(die);
                                        diceInHand.remove(die);
                                        continue diceLoop;
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 3:
                    /*List<IDie> allDice = new ArrayList<>();
                    allDice.addAll(dice);
                    allDice.addAll(diceInHand);

                    currentPlayer.GetScoreBoard().GetOptions((IDie[]) allDice.toArray());*/
                    inProgress = false;
                    break;
            }
            System.out.println(" ");
        }
    }

    public void start(IPlayer player) {
        rolls = 0;
        this.diceInHand = new ArrayList<>();
        this.currentPlayer = player;
        List<IDie> dice = new ArrayList<>();
        for (int j = 0; j < 5; j++) {
            dice.add(new Die());
        }
        for (int i = 0; i < 3; i++) {
            roll(dice);
            keepDice(dice);
        }
    }
}
